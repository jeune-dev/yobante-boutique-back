// ─────────────────────────────────────────────────────────────
// services/client/banniere.service.js
// ─────────────────────────────────────────────────────────────
const { Banniere, Categorie } = require('../../models');

class BanniereClientService {
  static async getActives() {
    const bannieres = await Banniere.findAll({
      where: { isActive: true },
      include: [{ model: Categorie, as: 'categorie', attributes: ['id', 'nom', 'slug'] }],
      order: [['ordre', 'ASC']],
    });
    return { success: true, bannieres };
  }
}

module.exports = BanniereClientService;
