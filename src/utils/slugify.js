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
 * Génère un slug unique pour un modèle donné (ex: Categorie, Produit).
 * @param {import('sequelize').Model} Model - le modèle Sequelize sur lequel vérifier l'unicité
 * @param {string} nom - le texte source du slug
 * @param {string} [excludeId] - id à exclure de la vérification (cas d'une mise à jour)
 */
async function generateUniqueSlug(Model, nom, excludeId = null) {
  const { Op } = require('sequelize');
  let suffix = 0;

  while (true) {
    const candidat = suffix === 0 ? slugify(nom) : uniqueSlug(nom, suffix);
    const where = { slug: candidat };
    if (excludeId) where.id = { [Op.ne]: excludeId };
    const existant = await Model.findOne({ where });
    if (!existant) return candidat;
    suffix += 1;
  }
}

module.exports = { slugify, uniqueSlug, generateUniqueSlug };
