const { Op } = require('sequelize');
const { Commande, CommandeItem, Produit, User, Adresse, sequelize } = require('../../models');
const paginate = require('../../utils/paginate');
const { round2 } = require('../../utils/money');
const { STATUT_COMMANDE } = require('../../constants');

// Une commande annulée ne compte ni dans le chiffre d'affaires ni dans les ventes.
const STATUTS_VENDUS = Object.values(STATUT_COMMANDE).filter((s) => s !== STATUT_COMMANDE.ANNULEE);

/**
 * Vue vendeur des commandes.
 *
 * Une commande peut mélanger les produits de plusieurs vendeurs : on ne renvoie
 * donc jamais la commande brute, mais uniquement les lignes appartenant au
 * vendeur courant, plus un `montantVendeur` recalculé sur ces seules lignes.
 * `montantTotal` de la commande n'est volontairement pas exposé : il inclut les
 * produits des autres vendeurs.
 */
class VendeurCommandeService {
  /** Ids des commandes contenant au moins un produit du vendeur. */
  static async #commandeIdsDuVendeur(vendeurId) {
    const lignes = await CommandeItem.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('CommandeItem.commandeId')), 'commandeId'],
      ],
      include: [
        {
          model: Produit,
          as: 'produit',
          attributes: [],
          where: { vendeurId },
          required: true,
        },
      ],
      raw: true,
    });
    return lignes.map((l) => l.commandeId);
  }

  static async getMesCommandes(vendeurId, { page, limit, statut } = {}) {
    const { page: p, limit: l, offset } = paginate(page, limit);

    const commandeIds = await this.#commandeIdsDuVendeur(vendeurId);
    if (!commandeIds.length) {
      return {
        success: true,
        commandes: [],
        pagination: { total: 0, totalPages: 0, page: p, limit: l },
      };
    }

    const where = { id: { [Op.in]: commandeIds } };
    if (statut) where.statut = statut;

    // Pagination en deux temps : on sélectionne d'abord les ids de la page, puis
    // on charge les lignes sans `limit`. Combiner `limit` et un include hasMany
    // filtré pousse Sequelize à générer une sous-requête dans laquelle le `where`
    // sur `produit` ne peut plus référencer la table jointe.
    const [count, pageIds] = await Promise.all([
      Commande.count({ where }),
      Commande.findAll({
        where,
        attributes: ['id'],
        order: [['createdAt', 'DESC']],
        limit: l,
        offset,
        raw: true,
      }),
    ]);

    const rows = pageIds.length
      ? await Commande.findAll({
          where: { id: { [Op.in]: pageIds.map((c) => c.id) } },
          include: [
            { model: User, as: 'user', attributes: ['id', 'nom', 'prenom', 'telephone'] },
            { model: Adresse, as: 'adresse', attributes: ['id', 'ville', 'rue'] },
            {
              model: CommandeItem,
              as: 'items',
              required: true,
              include: [
                {
                  model: Produit,
                  as: 'produit',
                  attributes: ['id', 'nom', 'slug', 'images', 'vendeurId'],
                  where: { vendeurId },
                  required: true,
                },
              ],
            },
          ],
          order: [['createdAt', 'DESC']],
        })
      : [];

    const commandes = rows.map((c) => {
      const json = c.toJSON();
      const montantVendeur = round2(json.items.reduce((sum, i) => sum + Number(i.sousTotal), 0));
      delete json.montantTotal;
      return { ...json, montantVendeur };
    });

    return {
      success: true,
      commandes,
      pagination: { total: count, totalPages: Math.ceil(count / l), page: p, limit: l },
    };
  }

  static async getCommandeById(vendeurId, id) {
    // findAll plutôt que findOne : ce dernier ajoute un `limit: 1` implicite qui
    // déclencherait la même sous-requête incompatible que dans getMesCommandes.
    const [commande] = await Commande.findAll({
      where: { id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'nom', 'prenom', 'telephone', 'email'] },
        { model: Adresse, as: 'adresse' },
        {
          model: CommandeItem,
          as: 'items',
          required: true,
          include: [
            {
              model: Produit,
              as: 'produit',
              attributes: ['id', 'nom', 'slug', 'images', 'vendeurId'],
              where: { vendeurId },
              required: true,
            },
          ],
        },
      ],
    });

    // `required: true` sur les includes : une commande sans ligne du vendeur
    // ressort introuvable, ce qui est exactement le comportement voulu.
    if (!commande) return { success: false, message: 'Commande introuvable' };

    const json = commande.toJSON();
    const montantVendeur = round2(json.items.reduce((sum, i) => sum + Number(i.sousTotal), 0));
    delete json.montantTotal;

    return { success: true, commande: { ...json, montantVendeur } };
  }

  /**
   * Agrégats de ventes du vendeur : CA, volumes, top produits et série
   * journalière pour le graphique de l'accueil mobile.
   */
  static async getVentes(vendeurId, { jours = 30 } = {}) {
    const depuis = new Date();
    depuis.setDate(depuis.getDate() - Number(jours));

    const lignesVendeur = {
      model: Produit,
      as: 'produit',
      attributes: [],
      where: { vendeurId },
      required: true,
    };
    const commandeVendue = {
      model: Commande,
      as: 'commande',
      attributes: [],
      where: { statut: { [Op.in]: STATUTS_VENDUS } },
      required: true,
    };

    const [totaux, totauxPeriode, topProduits, parJour] = await Promise.all([
      // Cumul depuis toujours
      CommandeItem.findOne({
        attributes: [
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('sousTotal')), 0), 'ca'],
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('quantite')), 0), 'unites'],
          [
            sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('commande.id'))),
            'commandes',
          ],
        ],
        include: [lignesVendeur, commandeVendue],
        raw: true,
      }),
      // Même chose restreint à la période demandée
      CommandeItem.findOne({
        attributes: [
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('sousTotal')), 0), 'ca'],
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('quantite')), 0), 'unites'],
          [
            sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('commande.id'))),
            'commandes',
          ],
        ],
        include: [
          lignesVendeur,
          {
            ...commandeVendue,
            where: {
              statut: { [Op.in]: STATUTS_VENDUS },
              createdAt: { [Op.gte]: depuis },
            },
          },
        ],
        raw: true,
      }),
      CommandeItem.findAll({
        attributes: [
          'produitId',
          [sequelize.col('produit.nom'), 'nom'],
          [sequelize.fn('SUM', sequelize.col('quantite')), 'unites'],
          [sequelize.fn('SUM', sequelize.col('sousTotal')), 'ca'],
        ],
        include: [{ ...lignesVendeur, attributes: [] }, commandeVendue],
        group: ['CommandeItem.produitId', 'produit.id', 'produit.nom'],
        order: [[sequelize.literal('unites'), 'DESC']],
        limit: 5,
        raw: true,
      }),
      CommandeItem.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('commande.createdAt')), 'jour'],
          [sequelize.fn('SUM', sequelize.col('sousTotal')), 'ca'],
          [sequelize.fn('SUM', sequelize.col('quantite')), 'unites'],
        ],
        include: [
          lignesVendeur,
          {
            ...commandeVendue,
            where: {
              statut: { [Op.in]: STATUTS_VENDUS },
              createdAt: { [Op.gte]: depuis },
            },
          },
        ],
        group: [sequelize.fn('DATE', sequelize.col('commande.createdAt'))],
        order: [[sequelize.fn('DATE', sequelize.col('commande.createdAt')), 'ASC']],
        raw: true,
      }),
    ]);

    const enAttente = await Commande.count({
      where: {
        statut: { [Op.in]: [STATUT_COMMANDE.EN_ATTENTE, STATUT_COMMANDE.VALIDEE] },
        id: { [Op.in]: await this.#commandeIdsDuVendeur(vendeurId) },
      },
    });

    return {
      success: true,
      ventes: {
        chiffreAffaires: round2(totaux.ca),
        unitesVendues: Number(totaux.unites),
        nombreCommandes: Number(totaux.commandes),
        periode: {
          jours: Number(jours),
          chiffreAffaires: round2(totauxPeriode.ca),
          unitesVendues: Number(totauxPeriode.unites),
          nombreCommandes: Number(totauxPeriode.commandes),
        },
        commandesATraiter: enAttente,
        topProduits: topProduits.map((t) => ({
          produitId: t.produitId,
          nom: t.nom,
          unites: Number(t.unites),
          chiffreAffaires: round2(t.ca),
        })),
        parJour: parJour.map((j) => ({
          jour: j.jour,
          chiffreAffaires: round2(j.ca),
          unites: Number(j.unites),
        })),
      },
    };
  }
}

module.exports = VendeurCommandeService;
