'use strict';
const { Op } = require('sequelize');
const { Rayon, SousRayon } = require('../../models');
const paginate = require('../../utils/paginate');

function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

class RayonService {
  static async lister({ page, limit, search, actif } = {}) {
    const { page: p, limit: l, offset } = paginate(page, limit);
    const where = {};
    if (actif !== undefined) where.isActive = actif === 'true' || actif === true;
    if (search) where.nom = { [Op.iLike]: `%${search}%` };
    const { count, rows } = await Rayon.findAndCountAll({
      where,
      include: [
        {
          model: SousRayon,
          as: 'sousRayons',
          required: false,
          attributes: ['id', 'nom', 'slug', 'isActive', 'image'],
        },
      ],
      order: [['nom', 'ASC']],
      limit: l,
      offset,
    });
    return {
      success: true,
      rayons: rows,
      pagination: { total: count, totalPages: Math.ceil(count / l), page: p, limit: l },
    };
  }

  static async getById(id) {
    const rayon = await Rayon.findByPk(id, {
      include: [{ model: SousRayon, as: 'sousRayons', order: [['nom', 'ASC']] }],
    });
    if (!rayon) return { success: false, message: 'Rayon introuvable' };
    return { success: true, rayon };
  }

  static async creer({ nom, description, image }) {
    const slug = toSlug(nom);
    const exist = await Rayon.findOne({ where: { slug } });
    if (exist) return { success: false, message: 'Un rayon avec ce nom existe déjà' };
    const rayon = await Rayon.create({ nom, slug, description, image });
    return { success: true, message: 'Rayon créé', rayon };
  }

  static async modifier(id, data) {
    const rayon = await Rayon.findByPk(id);
    if (!rayon) return { success: false, message: 'Rayon introuvable' };
    if (data.nom) data.slug = toSlug(data.nom);
    await rayon.update(data);
    return { success: true, message: 'Rayon modifié', rayon };
  }

  static async archiver(id) {
    const rayon = await Rayon.findByPk(id);
    if (!rayon) return { success: false, message: 'Rayon introuvable' };
    await rayon.update({ isActive: !rayon.isActive });
    return { success: true, message: rayon.isActive ? 'Rayon archivé' : 'Rayon restauré', rayon };
  }

  // Sous-rayons
  static async listerSousRayons(rayonId, { page, limit, search } = {}) {
    const rayon = await Rayon.findByPk(rayonId);
    if (!rayon) return { success: false, message: 'Rayon introuvable' };
    const { page: p, limit: l, offset } = paginate(page, limit);
    const where = { rayonId };
    if (search) where.nom = { [Op.iLike]: `%${search}%` };
    const { count, rows } = await SousRayon.findAndCountAll({
      where,
      order: [['nom', 'ASC']],
      limit: l,
      offset,
    });
    return {
      success: true,
      sousRayons: rows,
      pagination: { total: count, totalPages: Math.ceil(count / l), page: p, limit: l },
    };
  }

  static async creerSousRayon(rayonId, { nom, description, image }) {
    const rayon = await Rayon.findByPk(rayonId);
    if (!rayon) return { success: false, message: 'Rayon introuvable' };
    const slug = toSlug(nom);
    const exist = await SousRayon.findOne({ where: { slug } });
    if (exist) return { success: false, message: 'Un sous-rayon avec ce nom existe déjà' };
    const sousRayon = await SousRayon.create({ nom, slug, description, image, rayonId });
    return { success: true, message: 'Sous-rayon créé', sousRayon };
  }

  static async modifierSousRayon(id, data) {
    const sr = await SousRayon.findByPk(id);
    if (!sr) return { success: false, message: 'Sous-rayon introuvable' };
    if (data.nom) data.slug = toSlug(data.nom);
    await sr.update(data);
    return { success: true, message: 'Sous-rayon modifié', sousRayon: sr };
  }

  static async archiverSousRayon(id) {
    const sr = await SousRayon.findByPk(id);
    if (!sr) return { success: false, message: 'Sous-rayon introuvable' };
    await sr.update({ isActive: !sr.isActive });
    return {
      success: true,
      message: sr.isActive ? 'Sous-rayon archivé' : 'Sous-rayon restauré',
      sousRayon: sr,
    };
  }
}

module.exports = RayonService;
