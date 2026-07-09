const { Op } = require('sequelize');

const slugify = (text) =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const uniqueSlug = (text, suffix) => `${slugify(text)}-${suffix}`;

/**
 * Génère un slug unique en base.
 * Stratégie : lecture optimiste → si la contrainte UNIQUE est violée en concurrence,
 * on incrémente le suffixe et on réessaie (max 20 tentatives).
 */
async function generateUniqueSlug(Model, nom, excludeId = null) {
  const base = slugify(nom);
  let suffix = 0;
  let attempts = 0;
  const MAX = 20;

  while (attempts < MAX) {
    const candidat = suffix === 0 ? base : uniqueSlug(nom, suffix);
    const where = { slug: candidat };
    if (excludeId) where.id = { [Op.ne]: excludeId };

    const existant = await Model.findOne({ where, attributes: ['id'] });
    if (!existant) return candidat;

    suffix += 1;
    attempts += 1;
  }

  // Fallback ultime : timestamp — impossible à collisionner
  return `${base}-${Date.now()}`;
}

/**
 * Wrapper pour les créations : si un SequelizeUniqueConstraintError sur le slug
 * arrive malgré tout (race condition entre deux requêtes), on génère un nouveau slug
 * et on réessaie la création une seule fois.
 */
async function createWithUniqueSlug(Model, data, nom) {
  try {
    return await Model.create(data);
  } catch (err) {
    if (
      err.name === 'SequelizeUniqueConstraintError' &&
      err.errors?.some((e) => e.path === 'slug')
    ) {
      const fallbackSlug = `${slugify(nom)}-${Date.now()}`;
      return Model.create({ ...data, slug: fallbackSlug });
    }
    throw err;
  }
}

module.exports = { slugify, uniqueSlug, generateUniqueSlug, createWithUniqueSlug };
