// ─────────────────────────────────────────────────────────────
// services/admin/promotion.service.js
// ─────────────────────────────────────────────────────────────
const { Op } = require('sequelize');
const { Promotion, Produit, Categorie } = require('../../models');
const paginate = require('../../utils/paginate');

class PromotionService {
  static async getAll({ page, limit, section, isActive, blocPromoId } = {}) {
    const { page: p, limit: l, offset } = paginate(page, limit);
    const where = {};
    if (section) where.section = section;
    // Permet à l'écran d'une sous-section de ne lister que ses produits.
    if (blocPromoId) where.blocPromoId = blocPromoId;
    if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;

    const { count, rows } = await Promotion.findAndCountAll({
      where,
      include: [
        {
          model: Produit,
          as: 'produit',
          include: [{ model: Categorie, as: 'categorie', attributes: ['id', 'nom'] }],
        },
      ],
      order: [
        ['section', 'ASC'],
        ['ordre', 'ASC'],
      ],
      limit: l,
      offset,
      distinct: true,
    });

    return {
      success: true,
      promotions: rows,
      pagination: { total: count, totalPages: Math.ceil(count / l), page: p, limit: l },
    };
  }

  static async getById(id) {
    const promo = await Promotion.findByPk(id, {
      include: [{ model: Produit, as: 'produit' }],
    });
    if (!promo) return { success: false, message: 'Promotion introuvable' };
    return { success: true, promotion: promo };
  }

  static _validerChampsPrix(data, produit) {
    if (data.prixPromo !== undefined) {
      const prixPromo = Number(data.prixPromo);
      const prixOriginal = Number(produit.prix);
      if (prixPromo <= 0) return 'Le prix promotionnel doit être positif';
      if (prixPromo >= prixOriginal)
        return `Le prix promotionnel (${prixPromo}) doit être inférieur au prix original (${prixOriginal})`;
    }
    if (data.pourcentageReduction !== undefined) {
      const pct = Number(data.pourcentageReduction);
      if (pct <= 0 || pct > 100) return 'Le pourcentage de réduction doit être entre 1 et 100';
    }
    return null;
  }

  static async create(data) {
    const produit = await Produit.findByPk(data.produitId);
    if (!produit) return { success: false, message: 'Produit introuvable' };

    const erreur = PromotionService._validerChampsPrix(data, produit);
    if (erreur) return { success: false, message: erreur };

    const promo = await Promotion.create(data);
    return { success: true, message: 'Promotion créée', promotion: promo };
  }

  static async update(id, data) {
    const promo = await Promotion.findByPk(id, { include: [{ model: Produit, as: 'produit' }] });
    if (!promo) return { success: false, message: 'Promotion introuvable' };

    if (promo.produit) {
      const erreur = PromotionService._validerChampsPrix(data, promo.produit);
      if (erreur) return { success: false, message: erreur };
    }

    await promo.update(data);
    return { success: true, message: 'Promotion mise à jour', promotion: promo };
  }

  static async remove(id) {
    const promo = await Promotion.findByPk(id);
    if (!promo) return { success: false, message: 'Promotion introuvable' };

    await promo.destroy();
    return { success: true, message: 'Promotion supprimée' };
  }

  static async toggleActive(id) {
    const promo = await Promotion.findByPk(id);
    if (!promo) return { success: false, message: 'Promotion introuvable' };

    promo.isActive = !promo.isActive;
    await promo.save();
    return { success: true, promotion: promo };
  }

  /**
   * Réordonne les produits d'une sous-section : [{ id, ordre }].
   * C'est l'ordre dans lequel le client les verra.
   */
  static async reordonner(elements = []) {
    if (!Array.isArray(elements) || !elements.length) {
      return { success: false, message: 'Aucun ordre fourni' };
    }
    await Promise.all(
      elements
        .filter((e) => e && e.id)
        .map((e) => Promotion.update({ ordre: Number(e.ordre) || 0 }, { where: { id: e.id } }))
    );
    return { success: true, message: 'Ordre mis à jour' };
  }

  static async creerPromotion(
    produitId,
    { section, pourcentageReduction, dateDebut, dateFin, titre }
  ) {
    const produit = await Produit.findByPk(produitId);
    if (!produit) return { success: false, message: 'Produit introuvable' };

    const prixPromo = parseFloat((produit.prix * (1 - pourcentageReduction / 100)).toFixed(2));
    const now = new Date();
    const debut = new Date(dateDebut);
    const isActive = debut <= now;

    // Désactiver les anciennes promos du même produit pour la même section
    await Promotion.update({ isActive: false }, { where: { produitId, section, isActive: true } });

    const promo = await Promotion.create({
      produitId,
      section,
      titre: titre || `Promo ${section}`,
      prixPromo,
      pourcentageReduction,
      dateDebut: debut,
      dateFin: new Date(dateFin),
      isActive,
    });

    // Mettre à jour le prixPromo du produit si la promo est active maintenant
    if (isActive) await produit.update({ prixPromo });

    return { success: true, message: 'Promotion créée', promo };
  }

  /** Retourne les promotions regroupées par section (pour le dashboard admin) */
  static async getParSection() {
    const now = new Date();
    const sections = ['nos_promos_du_moment', 'a_ne_pas_rater', 'nos_promos_a_venir'];
    const result = {};

    for (const section of sections) {
      result[section] = await Promotion.findAll({
        where: {
          section,
          isActive: true,
          [Op.or]: [{ dateFin: null }, { dateFin: { [Op.gte]: now } }],
        },
        include: [{ model: Produit, as: 'produit' }],
        order: [['ordre', 'ASC']],
      });
    }

    return { success: true, sections: result };
  }
}

module.exports = PromotionService;
