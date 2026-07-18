const { Op } = require('sequelize');
const { Produit, Categorie, User } = require('../../models');

async function _sendProduitEmail(vendeurId, sujet, html) {
  try {
    const vendeur = await User.findByPk(vendeurId, { attributes: ['email'] });
    if (!vendeur) return;
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM || 'Yobante Boutique <noreply@yobante.com>',
      to: vendeur.email,
      subject: sujet,
      html,
    });
  } catch (err) {
    require('../config/logger').error('[Produit] Email non envoyé', { error: err.message });
  }
}
const { generateUniqueSlug } = require('../../utils/slugify');
const paginate = require('../../utils/paginate');
const { uploadImage, deleteImage } = require('../upload.service');
const { STATUT_VALIDATION_PRODUIT } = require('../../constants');
const NotificationService = require('../notification');

class GestionProduitService {
  static async createProduit(data, files = []) {
    const categorie = await Categorie.findByPk(data.categorieId);
    if (!categorie) return { success: false, message: 'Catégorie introuvable' };

    const slug = await generateUniqueSlug(Produit, data.nom);
    const updates = { ...data, slug };

    if (files && files.length) {
      const results = await Promise.allSettled(
        files.map((f) => uploadImage(f.buffer, f.originalname, 'produits'))
      );
      updates.images = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
    }

    const produit = await Produit.create(updates);
    return { success: true, message: 'Produit créé avec succès', produit };
  }

  static async updateProduit(id, data, files = []) {
    const produit = await Produit.findByPk(id);
    if (!produit) return { success: false, message: 'Produit introuvable' };

    if (data.categorieId) {
      const categorie = await Categorie.findByPk(data.categorieId);
      if (!categorie) return { success: false, message: 'Catégorie introuvable' };
    }

    const updates = { ...data };
    if (data.nom && data.nom !== produit.nom) {
      updates.slug = await generateUniqueSlug(Produit, data.nom, id);
    }

    if (files && files.length) {
      const anciennesImages = produit.images || [];
      const results = await Promise.allSettled(
        files.map((f) => uploadImage(f.buffer, f.originalname, 'produits'))
      );
      updates.images = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
      if (updates.images.length > 0) {
        await Promise.allSettled(anciennesImages.map((url) => deleteImage(url)));
      }
    }

    await produit.update(updates);
    return { success: true, message: 'Produit mis à jour avec succès', produit };
  }

  static async deleteProduit(id) {
    const produit = await Produit.findByPk(id);
    if (!produit) return { success: false, message: 'Produit introuvable' };
    await produit.update({ isActive: false });
    return { success: true, message: 'Produit désactivé avec succès' };
  }

  static async getProduitById(id) {
    const produit = await Produit.findByPk(id, {
      include: [{ model: Categorie, as: 'categorie' }],
    });
    if (!produit) return { success: false, message: 'Produit introuvable' };
    return { success: true, produit };
  }

  static async getAllProduits({
    page,
    limit,
    categorieId,
    rayonId,
    isActive,
    isFeatured,
    prixMin,
    prixMax,
    search,
  } = {}) {
    const { page: p, limit: l, offset } = paginate(page, limit);

    const where = {};
    if (categorieId) where.categorieId = categorieId;
    if (rayonId) where.rayonId = rayonId;
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
      message: 'Liste des produits',
      produits: rows,
      pagination: { total: count, totalPages: Math.ceil(count / l), page: p, limit: l },
    };
  }

  static async updateStock(id, quantite) {
    const produit = await Produit.findByPk(id);
    if (!produit) return { success: false, message: 'Produit introuvable' };
    await produit.update({ stock: quantite });
    return { success: true, message: 'Stock mis à jour avec succès', produit };
  }

  static async toggleFeatured(id) {
    const produit = await Produit.findByPk(id);
    if (!produit) return { success: false, message: 'Produit introuvable' };
    produit.isFeatured = !produit.isFeatured;
    await produit.save();
    return { success: true, message: 'Produit mis à jour avec succès', produit };
  }

  static async toggleVisibilite(id) {
    const produit = await Produit.findByPk(id);
    if (!produit) return { success: false, message: 'Produit introuvable' };
    produit.isActive = !produit.isActive;
    await produit.save();
    return { success: true, message: 'Produit mis à jour avec succès', produit };
  }

  /**
   * Validation step 1 — protégée contre la double validation simultanée.
   * UPDATE atomique WHERE statutValidation = 'en_attente' uniquement.
   * Si deux admins cliquent en même temps : un seul obtient nbRows=1.
   */
  static async validerProduitStep1(id) {
    const [nbRows] = await Produit.update(
      { statutValidation: STATUT_VALIDATION_PRODUIT.VALIDE_STEP1 },
      { where: { id, statutValidation: STATUT_VALIDATION_PRODUIT.EN_ATTENTE } }
    );

    if (nbRows === 0) {
      const produit = await Produit.findByPk(id);
      if (!produit) return { success: false, message: 'Produit introuvable' };
      return {
        success: false,
        message: `Statut actuel: ${produit.statutValidation} — attendu: en_attente`,
      };
    }

    const produit = await Produit.findByPk(id);
    return { success: true, message: 'Étape 1 validée', produit };
  }

  /**
   * Validation step 2 — WHERE statutValidation = 'valide_step1'.
   * Rend le produit visible sur le catalogue.
   */
  static async validerProduitStep2(id) {
    const [nbRows] = await Produit.update(
      { statutValidation: STATUT_VALIDATION_PRODUIT.VALIDE, isActive: true },
      { where: { id, statutValidation: STATUT_VALIDATION_PRODUIT.VALIDE_STEP1 } }
    );

    if (nbRows === 0) {
      const produit = await Produit.findByPk(id);
      if (!produit) return { success: false, message: 'Produit introuvable' };
      return {
        success: false,
        message: `Statut actuel: ${produit.statutValidation} — attendu: valide_step1`,
      };
    }

    const produit = await Produit.findByPk(id);
    // Email et notification sont complémentaires : le mail laisse une trace
    // hors application, la notification alimente la cloche et le push.
    if (produit && produit.vendeurId) {
      await _sendProduitEmail(
        produit.vendeurId,
        `Votre produit "${produit.nom}" a été validé`,
        `<div style="font-family:sans-serif"><p>Bonjour,</p><p>Votre produit <strong>${produit.nom}</strong> a été validé et est maintenant disponible sur Yobante Boutique.</p><p>Merci pour votre confiance !</p></div>`
      );

      await NotificationService.emettre({
        userId: produit.vendeurId,
        titre: 'Demande acceptée',
        message: `« ${produit.nom} » est publié sur le catalogue.`,
        type: 'produit',
        donnees: { produitId: produit.id },
      });
    }
    return { success: true, message: 'Produit validé et publié sur le catalogue', produit };
  }

  static async rejeterProduit(id, motif) {
    // Le motif est persisté : c'est ce que le vendeur lit dans le suivi de sa
    // demande. Auparavant il n'apparaissait que dans la réponse HTTP à l'admin
    // et était donc perdu.
    const [nbRows] = await Produit.update(
      {
        statutValidation: STATUT_VALIDATION_PRODUIT.REJETE,
        isActive: false,
        motifRejet: motif || null,
      },
      { where: { id } }
    );
    if (nbRows === 0) return { success: false, message: 'Produit introuvable' };
    const produit = await Produit.findByPk(id);
    if (produit && produit.vendeurId) {
      await _sendProduitEmail(
        produit.vendeurId,
        `Votre produit "${produit.nom}" n'a pas été validé`,
        `<div style="font-family:sans-serif"><p>Bonjour,</p><p>Votre produit <strong>${produit.nom}</strong> n'a pas été validé.${motif ? ` Motif : ${motif}.` : ''}</p><p>Veuillez contacter l'équipe Yobante pour plus d'informations.</p></div>`
      );

      await NotificationService.emettre({
        userId: produit.vendeurId,
        titre: 'Demande rejetée',
        message: motif ? `« ${produit.nom} » : ${motif}` : `« ${produit.nom} » n’a pas été retenu.`,
        type: 'produit',
        donnees: { produitId: produit.id },
      });
    }
    return { success: true, message: `Produit rejeté${motif ? ` : ${motif}` : ''}`, produit };
  }

  static async getProduitsAValider() {
    const { rows, count } = await Produit.findAndCountAll({
      where: {
        statutValidation: [
          STATUT_VALIDATION_PRODUIT.EN_ATTENTE,
          STATUT_VALIDATION_PRODUIT.VALIDE_STEP1,
        ],
      },
      include: [
        { model: Categorie, as: 'categorie' },
        { model: User, as: 'vendeur', attributes: ['id', 'nom', 'prenom', 'email'] },
      ],
      order: [['createdAt', 'ASC']],
    });
    return { success: true, produits: rows, total: count };
  }
}

module.exports = GestionProduitService;
