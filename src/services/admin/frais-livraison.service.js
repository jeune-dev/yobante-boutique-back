// ─────────────────────────────────────────────────────────────
// services/admin/frais-livraison.service.js
// ─────────────────────────────────────────────────────────────
const { FraisLivraison } = require('../../models');

class FraisLivraisonService {
  static async getAll() {
    const frais = await FraisLivraison.findAll({
      order: [
        ['pays', 'ASC'],
        ['region', 'ASC'],
        ['ville', 'ASC'],
      ],
    });
    return { success: true, frais };
  }

  static async getById(id) {
    const frais = await FraisLivraison.findByPk(id);
    if (!frais) return { success: false, message: 'Tarif introuvable' };
    return { success: true, frais };
  }

  static async create(data) {
    const frais = await FraisLivraison.create(data);
    return { success: true, message: 'Tarif de livraison créé', frais };
  }

  static async update(id, data) {
    const frais = await FraisLivraison.findByPk(id);
    if (!frais) return { success: false, message: 'Tarif introuvable' };

    await frais.update(data);
    return { success: true, message: 'Tarif mis à jour', frais };
  }

  static async remove(id) {
    const frais = await FraisLivraison.findByPk(id);
    if (!frais) return { success: false, message: 'Tarif introuvable' };

    await frais.destroy();
    return { success: true, message: 'Tarif supprimé' };
  }

  static async toggleActive(id) {
    const frais = await FraisLivraison.findByPk(id);
    if (!frais) return { success: false, message: 'Tarif introuvable' };

    frais.isActive = !frais.isActive;
    await frais.save();
    return { success: true, frais };
  }
}

module.exports = FraisLivraisonService;
