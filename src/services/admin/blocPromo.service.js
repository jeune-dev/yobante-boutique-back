// ─────────────────────────────────────────────────────────────
// services/admin/blocPromo.service.js
// Gestion des métadonnées (image, titre) des 3 blocs promo.
// ─────────────────────────────────────────────────────────────
const { BlocPromo } = require('../../models');
const { uploadImage, deleteImage } = require('../upload.service');

const SECTIONS = ['nos_promos_du_moment', 'a_ne_pas_rater', 'nos_promos_a_venir'];

class BlocPromoService {
  static async getAll() {
    const blocs = await BlocPromo.findAll({ order: [['ordre', 'ASC']] });
    return { success: true, blocs };
  }

  /** Met à jour (ou crée) le bloc d'une section. Upload l'image si fournie. */
  static async updateBySection(section, data, file) {
    if (!SECTIONS.includes(section)) {
      return { success: false, message: 'Section invalide' };
    }

    const [bloc] = await BlocPromo.findOrCreate({
      where: { section },
      defaults: { section },
    });

    const updates = {};
    if (data.titre !== undefined) updates.titre = data.titre;
    if (data.sousTitre !== undefined) updates.sousTitre = data.sousTitre;
    if (data.isActive !== undefined) {
      updates.isActive = data.isActive === 'true' || data.isActive === true;
    }

    if (file) {
      if (bloc.image) await deleteImage(bloc.image);
      updates.image = await uploadImage(file.buffer, file.originalname, 'blocs-promo');
    }

    await bloc.update(updates);
    return { success: true, message: 'Bloc promo mis à jour', bloc };
  }
}

module.exports = BlocPromoService;
