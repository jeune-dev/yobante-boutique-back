// ─────────────────────────────────────────────────────────────
// services/client/banniere.service.js
// ─────────────────────────────────────────────────────────────
const { Banniere, Categorie, Produit } = require('../../models');

class BanniereClientService {
  static async getActives() {
    const bannieres = await Banniere.findAll({
      where: { isActive: true },
      include: [
        { model: Categorie, as: 'categorie', attributes: ['id', 'nom', 'slug'] },
        {
          model: Produit,
          as: 'produits',
          through: { attributes: ['ordre'] },
          attributes: ['id', 'nom', 'slug', 'prix', 'prixPromo', 'images'],
        },
      ],
      order: [['ordre', 'ASC']],
    });
    return { success: true, bannieres };
  }
}

module.exports = BanniereClientService;
