// ─────────────────────────────────────────────────────────────
// services/admin/produit.service.js
// ─────────────────────────────────────────────────────────────
const { Op } = require('sequelize');
const { Produit, Categorie } = require('../../models');
const { generateUniqueSlug } = require('../../utils/slugify');
const paginate = require('../../utils/paginate');
const { uploadImage, deleteImage } = require('../../middlewares/uploadService');

class GestionProduitService {

  static async createProduit(data, files = []) {
    const categorie = await Categorie.findByPk(data.categorieId);
    if (!categorie) {
      return { success: false, message: "Catégorie introuvable" };
    }

    const slug = await generateUniqueSlug(Produit, data.nom);

    const updates = { ...data, slug };
    if (files && files.length) {
      updates.images = await Promise.all(files.map((f) => uploadImage(f.buffer, f.originalname, 'produits')));
    }

    const produit = await Produit.create(updates);

    return { success: true, message: "Produit créé avec succès", produit };
  }

  static async updateProduit(id, data, files = []) {
    const produit = await Produit.findByPk(id);
    if (!produit) {
      return { success: false, message: "Produit introuvable" };
    }

    if (data.categorieId) {
      const categorie = await Categorie.findByPk(data.categorieId);
      if (!categorie) {
        return { success: false, message: "Catégorie introuvable" };
      }
    }

    const updates = { ...data };
    if (data.nom && data.nom !== produit.nom) {
      updates.slug = await generateUniqueSlug(Produit, data.nom, id);
    }

    if (files && files.length) {
      const anciennesImages = produit.images || [];
      updates.images = await Promise.all(files.map((f) => uploadImage(f.buffer, f.originalname, 'produits')));
      await Promise.all(anciennesImages.map((url) => deleteImage(url)));
    }

    await produit.update(updates);

    return { success: true, message: "Produit mis à jour avec succès", produit };
  }

  static async deleteProduit(id) {
    const produit = await Produit.findByPk(id);
    if (!produit) {
      return { success: false, message: "Produit introuvable" };
    }

    await produit.update({ isActive: false });

    return { success: true, message: "Produit désactivé avec succès" };
  }

  static async getProduitById(id) {
    const produit = await Produit.findByPk(id, {
      include: [{ model: Categorie, as: 'categorie' }],
    });

    if (!produit) {
      return { success: false, message: "Produit introuvable" };
    }

    return { success: true, produit };
  }

  static async getAllProduits({ page, limit, categorieId, isActive, isFeatured, prixMin, prixMax, search } = {}) {
    const { page: p, limit: l, offset } = paginate(page, limit);

    const where = {};
    if (categorieId) where.categorieId = categorieId;
    if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;
    if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (prixMin || prixMax) {
      where.prix = {};
      if (prixMin) where.prix[Op.gte] = prixMin;
      if (prixMax) where.prix[Op.lte] = prixMax;
    }
    if (search) {
      where[Op.or] = [
        { nom: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Produit.findAndCountAll({
      where,
      include: [{ model: Categorie, as: 'categorie' }],
      order: [['createdAt', 'DESC']],
      limit: l,
      offset,
    });

    return {
      success: true,
      message: "Liste des produits",
      produits: rows,
      pagination: { total: count, totalPages: Math.ceil(count / l), page: p, limit: l },
    };
  }

  static async updateStock(id, quantite) {
    const produit = await Produit.findByPk(id);
    if (!produit) {
      return { success: false, message: "Produit introuvable" };
    }

    await produit.update({ stock: quantite });

    return { success: true, message: "Stock mis à jour avec succès", produit };
  }

  static async toggleFeatured(id) {
    const produit = await Produit.findByPk(id);
    if (!produit) {
      return { success: false, message: "Produit introuvable" };
    }

    produit.isFeatured = !produit.isFeatured;
    await produit.save();

    return { success: true, message: "Produit mis à jour avec succès", produit };
  }

  static async toggleVisibilite(id) {
    const produit = await Produit.findByPk(id);
    if (!produit) {
      return { success: false, message: "Produit introuvable" };
    }

    produit.isActive = !produit.isActive;
    await produit.save();

    return { success: true, message: "Produit mis à jour avec succès", produit };
  }
}

module.exports = GestionProduitService;
