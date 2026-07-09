// ─────────────────────────────────────────────────────────────
// services/client/frais-livraison.service.js
// ─────────────────────────────────────────────────────────────
const { FraisLivraison } = require('../../models');

class FraisLivraisonClientService {
  static async getActifs() {
    const frais = await FraisLivraison.findAll({
      where: { isActive: true },
      order: [
        ['pays', 'ASC'],
        ['region', 'ASC'],
        ['ville', 'ASC'],
      ],
    });
    return { success: true, frais };
  }

  static async getParVille(ville) {
    const frais = await FraisLivraison.findOne({
      where: { ville, isActive: true },
    });
    return { success: true, frais };
  }
}

module.exports = FraisLivraisonClientService;
