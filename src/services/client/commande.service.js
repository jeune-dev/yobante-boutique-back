// ─────────────────────────────────────────────────────────────
// services/client/commande.service.js
// ─────────────────────────────────────────────────────────────
const { Op } = require('sequelize');
const { Commande, CommandeItem, Panier, Produit, Adresse, Paiement, User, sequelize } = require('../../models');
const paginate = require('../../utils/paginate');
const { sendCommandeConfirmation } = require('../../utils/mailer');

const FRAIS_LIVRAISON = 2000; // FCFA, forfait fixe

function _genererReference() {
  return `CMD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

class CommandeService {

  static async passerCommande(userId, { adresseId, note, methode }) {
    const adresse = await Adresse.findOne({ where: { id: adresseId, userId } });
    if (!adresse) {
      return { success: false, message: "Adresse introuvable" };
    }

    const lignesPanier = await Panier.findAll({ where: { userId }, include: [{ model: Produit, as: 'produit' }] });
    if (!lignesPanier.length) {
      return { success: false, message: "Votre panier est vide" };
    }

    for (const ligne of lignesPanier) {
      if (!ligne.produit.isActive) {
        return { success: false, message: `"${ligne.produit.nom}" n'est plus disponible` };
      }
    }

    const t = await sequelize.transaction();
    try {
      const sousTotal = lignesPanier.reduce((sum, l) => sum + Number(l.produit.prix) * l.quantite, 0);

      const commande = await Commande.create({
        reference: _genererReference(),
        userId,
        adresseId,
        montantTotal: sousTotal + FRAIS_LIVRAISON,
        fraisLivraison: FRAIS_LIVRAISON,
        note,
      }, { transaction: t });

      const items = [];
      for (const ligne of lignesPanier) {
        // Décrément atomique et conditionnel (stock >= quantité demandée) pour éviter
        // la survente en cas de commandes concurrentes sur le même produit.
        // Ce contrôle doit rester séquentiel (chaque vérification dépend de l'état réel en base).
        const quantite = Number(ligne.quantite);
        const [nbLignesAffectees] = await Produit.update(
          { stock: sequelize.literal(`stock - ${quantite}`) },
          { where: { id: ligne.produitId, stock: { [Op.gte]: quantite } }, transaction: t }
        );

        if (nbLignesAffectees === 0) {
          await t.rollback();
          return { success: false, message: `Stock insuffisant pour "${ligne.produit.nom}"` };
        }

        items.push({
          commandeId: commande.id,
          produitId: ligne.produitId,
          quantite: ligne.quantite,
          prixUnitaire: ligne.produit.prix,
          sousTotal: Number(ligne.produit.prix) * ligne.quantite,
        });
      }

      await CommandeItem.bulkCreate(items, { transaction: t });

      await Paiement.create({
        commandeId: commande.id,
        userId,
        montant: commande.montantTotal,
        methode,
      }, { transaction: t });

      await Panier.destroy({ where: { userId }, transaction: t });

      await t.commit();

      const commandeComplete = await Commande.findByPk(commande.id, {
        include: [
          { model: CommandeItem, as: 'items', include: [{ model: Produit, as: 'produit' }] },
          { model: Paiement, as: 'paiement' },
        ],
      });

      const user = await User.findByPk(userId);
      if (user) await sendCommandeConfirmation(user.email, commandeComplete);

      return { success: true, message: "Commande passée avec succès", commande: commandeComplete };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async getMesCommandes(userId, { page, limit } = {}) {
    const { page: p, limit: l, offset } = paginate(page, limit);

    const { count, rows } = await Commande.findAndCountAll({
      where: { userId },
      include: [{ model: CommandeItem, as: 'items', include: [{ model: Produit, as: 'produit' }] }],
      order: [['createdAt', 'DESC']],
      limit: l,
      offset,
    });

    return {
      success: true,
      commandes: rows,
      pagination: { total: count, totalPages: Math.ceil(count / l), page: p, limit: l },
    };
  }

  static async getCommandeDetail(userId, commandeId) {
    const commande = await Commande.findByPk(commandeId, {
      include: [
        { model: CommandeItem, as: 'items', include: [{ model: Produit, as: 'produit' }] },
        { model: Adresse, as: 'adresse' },
        { model: Paiement, as: 'paiement' },
      ],
    });

    if (!commande) {
      return { success: false, status: 404, message: "Commande introuvable" };
    }

    if (commande.userId !== userId) {
      return { success: false, status: 403, message: "Cette commande ne vous appartient pas" };
    }

    return { success: true, commande };
  }

  static async annulerCommande(userId, commandeId) {
    const commande = await Commande.findByPk(commandeId, {
      include: [{ model: CommandeItem, as: 'items' }],
    });

    if (!commande) {
      return { success: false, status: 404, message: "Commande introuvable" };
    }

    if (commande.userId !== userId) {
      return { success: false, status: 403, message: "Cette commande ne vous appartient pas" };
    }

    if (commande.statut !== 'en_attente') {
      return { success: false, status: 400, message: "Seule une commande en attente peut être annulée" };
    }

    const t = await sequelize.transaction();
    try {
      // Restitution du stock : chaque ligne cible un produit différent, aucune dépendance
      // d'ordre entre elles, donc sûr à paralléliser.
      await Promise.all(commande.items.map((item) =>
        Produit.increment('stock', { by: item.quantite, where: { id: item.produitId }, transaction: t })
      ));

      await commande.update({ statut: 'annulee' }, { transaction: t });
      await t.commit();

      return { success: true, message: "Commande annulée avec succès", commande };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}

module.exports = CommandeService;
