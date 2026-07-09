// ─────────────────────────────────────────────────────────────
// services/admin/avis.service.js
// ─────────────────────────────────────────────────────────────
const { Avis, User, Produit } = require('../../models');
const { recalculerNoteMoyenne } = require('../../utils/avisHelper');

class GestionAvisService {
  static async getAllAvis({ isApproved, produitId, userId } = {}) {
    const where = {};
    if (isApproved !== undefined) where.isApproved = isApproved === 'true' || isApproved === true;
    if (produitId) where.produitId = produitId;
    if (userId) where.userId = userId;

    const avis = await Avis.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'nom', 'prenom', 'avatar'] },
        { model: Produit, as: 'produit', attributes: ['id', 'nom', 'slug'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    return { success: true, avis };
  }

  static async approuverAvis(id) {
    const avis = await Avis.findByPk(id);
    if (!avis) return { success: false, message: 'Avis introuvable' };

    await avis.update({ isApproved: true });
    await recalculerNoteMoyenne(avis.produitId);

    return { success: true, message: 'Avis approuvé avec succès', avis };
  }

  static async rejeterAvis(id) {
    const avis = await Avis.findByPk(id);
    if (!avis) return { success: false, message: 'Avis introuvable' };

    const { produitId } = avis;
    await avis.destroy();
    await recalculerNoteMoyenne(produitId);

    return { success: true, message: 'Avis supprimé avec succès' };
  }

  static async getAvisByProduit(produitId) {
    const avis = await Avis.findAll({
      where: { produitId, isApproved: true },
      include: [{ model: User, as: 'user', attributes: ['id', 'nom', 'prenom', 'avatar'] }],
      order: [['createdAt', 'DESC']],
    });

    const produit = await Produit.findByPk(produitId, {
      attributes: ['noteMoyenne', 'nombreAvis'],
    });

    return {
      success: true,
      avis,
      noteMoyenne: produit ? Number(produit.noteMoyenne) : 0,
      nombreAvis: produit ? produit.nombreAvis : 0,
    };
  }
}

module.exports = GestionAvisService;
