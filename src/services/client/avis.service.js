// ─────────────────────────────────────────────────────────────
// services/client/avis.service.js
// ─────────────────────────────────────────────────────────────
const { Avis, Produit } = require('../../models');

class AvisService {

  static async createAvis(userId, { produitId, note, commentaire }) {
    const produit = await Produit.findOne({ where: { id: produitId, isActive: true } });
    if (!produit) {
      return { success: false, message: "Produit introuvable" };
    }

    const existant = await Avis.findOne({ where: { userId, produitId } });
    if (existant) {
      return { success: false, message: "Vous avez déjà laissé un avis sur ce produit" };
    }

    const avis = await Avis.create({ userId, produitId, note, commentaire, isApproved: false });

    return { success: true, message: "Avis envoyé, en attente de modération", avis };
  }

  static async getMesAvis(userId) {
    const avis = await Avis.findAll({
      where: { userId },
      include: [{ model: Produit, as: 'produit' }],
      order: [['createdAt', 'DESC']],
    });

    return { success: true, avis };
  }

  static async updateAvis(userId, avisId, { note, commentaire }) {
    const avis = await Avis.findOne({ where: { id: avisId, userId } });
    if (!avis) {
      return { success: false, message: "Avis introuvable" };
    }

    const updates = { isApproved: false };
    if (note !== undefined) updates.note = note;
    if (commentaire !== undefined) updates.commentaire = commentaire;

    await avis.update(updates);

    return { success: true, message: "Avis mis à jour, en attente de modération", avis };
  }

  static async deleteAvis(userId, avisId) {
    const avis = await Avis.findOne({ where: { id: avisId, userId } });
    if (!avis) {
      return { success: false, message: "Avis introuvable" };
    }

    await avis.destroy();

    return { success: true, message: "Avis supprimé avec succès" };
  }
}

module.exports = AvisService;
