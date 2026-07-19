// ─────────────────────────────────────────────────────────────
// services/admin/avis.service.js
// ─────────────────────────────────────────────────────────────
const { Avis, User, Produit } = require('../../models');
const { recalculerNoteMoyenne } = require('../../utils/avisHelper');
const paginate = require('../../utils/paginate');

class GestionAvisService {
  static async getAllAvis({ isApproved, produitId, userId, page, limit } = {}) {
    const where = {};
    if (isApproved !== undefined) where.isApproved = isApproved === 'true' || isApproved === true;
    if (produitId) where.produitId = produitId;
    if (userId) where.userId = userId;

    // Paginé comme les autres listes d'administration : sans cela, l'écran
    // chargeait la totalité des avis et ses contrôles de page ne servaient à rien.
    const { page: p, limit: l, offset } = paginate(page, limit);

    const { count, rows } = await Avis.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'nom', 'prenom', 'avatar'] },
        { model: Produit, as: 'produit', attributes: ['id', 'nom', 'slug'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: l,
      offset,
      distinct: true,
    });

    return {
      success: true,
      avis: rows,
      pagination: { total: count, totalPages: Math.ceil(count / l), page: p, limit: l },
    };
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
