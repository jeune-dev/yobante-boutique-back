// ─────────────────────────────────────────────────────────────
// services/admin/banniere.service.js
// ─────────────────────────────────────────────────────────────
const { Banniere, Categorie } = require('../../models');
const { uploadImage, deleteImage } = require('../upload.service');

class BanniereService {
  static async getAll() {
    const bannieres = await Banniere.findAll({
      include: [{ model: Categorie, as: 'categorie', attributes: ['id', 'nom', 'slug'] }],
      order: [
        ['ordre', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });
    return { success: true, bannieres };
  }

  static async create(data, file) {
    if (!file) return { success: false, message: 'Image requise' };

    const imageUrl = await uploadImage(file.buffer, file.originalname, 'bannieres');
    const banniere = await Banniere.create({ ...data, image: imageUrl });
    return { success: true, message: 'Bannière créée avec succès', banniere };
  }

  static async update(id, data, file) {
    const banniere = await Banniere.findByPk(id);
    if (!banniere) return { success: false, message: 'Bannière introuvable' };

    const updates = { ...data };
    if (file) {
      await deleteImage(banniere.image);
      updates.image = await uploadImage(file.buffer, file.originalname, 'bannieres');
    }

    await banniere.update(updates);
    return { success: true, message: 'Bannière mise à jour', banniere };
  }

  static async remove(id) {
    const banniere = await Banniere.findByPk(id);
    if (!banniere) return { success: false, message: 'Bannière introuvable' };

    await deleteImage(banniere.image);
    await banniere.destroy();
    return { success: true, message: 'Bannière supprimée' };
  }

  static async toggleActive(id) {
    const banniere = await Banniere.findByPk(id);
    if (!banniere) return { success: false, message: 'Bannière introuvable' };

    banniere.isActive = !banniere.isActive;
    await banniere.save();
    return { success: true, banniere };
  }

  static async reordonner(ordres) {
    // ordres = [{ id, ordre }, ...]
    await Promise.all(ordres.map(({ id, ordre }) => Banniere.update({ ordre }, { where: { id } })));
    return { success: true, message: 'Ordre mis à jour' };
  }
}

module.exports = BanniereService;
