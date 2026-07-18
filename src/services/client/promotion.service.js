// ─────────────────────────────────────────────────────────────
// services/client/promotion.service.js
// ─────────────────────────────────────────────────────────────
const { Op } = require('sequelize');
const { Promotion, Produit, Categorie, Rayon, SousRayon } = require('../../models');

class PromotionClientService {
  /** Retourne les 3 sections promotionnelles pour la page Promotions de l'app */
  static async getSections() {
    const now = new Date();

    const baseWhere = (section) => ({
      section,
      isActive: true,
      [Op.or]: [{ dateDebut: null }, { dateDebut: { [Op.lte]: now } }],
      [Op.and]: [
        {
          [Op.or]: [{ dateFin: null }, { dateFin: { [Op.gte]: now } }],
        },
      ],
    });

    const includeProduct = [
      {
        model: Produit,
        as: 'produit',
        where: { isActive: true, statutValidation: 'valide' },
        include: [{ model: Categorie, as: 'categorie', attributes: ['id', 'nom', 'slug'] }],
      },
    ];

    const [nosPromos, aNePasRater, nosPromosAVenir] = await Promise.all([
      Promotion.findAll({
        where: baseWhere('nos_promos_du_moment'),
        include: includeProduct,
        order: [['ordre', 'ASC']],
      }),
      Promotion.findAll({
        where: baseWhere('a_ne_pas_rater'),
        include: includeProduct,
        order: [['ordre', 'ASC']],
      }),
      Promotion.findAll({
        where: {
          section: 'nos_promos_a_venir',
          isActive: true,
          [Op.or]: [{ dateFin: null }, { dateFin: { [Op.gte]: now } }],
        },
        include: includeProduct,
        order: [['dateDebut', 'ASC']],
      }),
    ]);

    return {
      success: true,
      sections: {
        nos_promos_du_moment: nosPromos,
        a_ne_pas_rater: aNePasRater,
        nos_promos_a_venir: nosPromosAVenir,
      },
    };
  }

  /** Liste plate de toutes les promotions actives (toutes sections confondues). */
  static async getActives() {
    const now = new Date();
    const promotions = await Promotion.findAll({
      where: {
        isActive: true,
        [Op.or]: [{ dateDebut: null }, { dateDebut: { [Op.lte]: now } }],
        [Op.and]: [
          {
            [Op.or]: [{ dateFin: null }, { dateFin: { [Op.gte]: now } }],
          },
        ],
      },
      include: [
        {
          model: Produit,
          as: 'produit',
          where: { isActive: true, statutValidation: 'valide' },
          include: [{ model: Categorie, as: 'categorie', attributes: ['id', 'nom', 'slug'] }],
        },
      ],
      order: [['ordre', 'ASC']],
    });

    return { success: true, promotions };
  }

  static async getPromotionsGroupees() {
    const sections = ['nos_promos_du_moment', 'a_ne_pas_rater', 'nos_promos_a_venir'];
    const result = {};
    for (const section of sections) {
      const promos = await Promotion.findAll({
        where: { section, isActive: true },
        include: [
          {
            model: Produit,
            as: 'produit',
            required: true,
            where: { isActive: true, statutValidation: 'valide' },
            include: [
              { model: Rayon, as: 'rayon', attributes: ['id', 'nom'] },
              { model: SousRayon, as: 'sousRayon', attributes: ['id', 'nom'] },
            ],
          },
        ],
        order: [['ordre', 'ASC']],
      });
      result[section] = promos;
    }
    return { success: true, promotions: result };
  }

  static async getSection(section) {
    const now = new Date();
    const promotions = await Promotion.findAll({
      where: {
        section,
        isActive: true,
        [Op.or]: [{ dateFin: null }, { dateFin: { [Op.gte]: now } }],
      },
      include: [
        {
          model: Produit,
          as: 'produit',
          where: { isActive: true, statutValidation: 'valide' },
          include: [{ model: Categorie, as: 'categorie', attributes: ['id', 'nom', 'slug'] }],
        },
      ],
      order: [['ordre', 'ASC']],
    });

    return { success: true, promotions };
  }
}

module.exports = PromotionClientService;
