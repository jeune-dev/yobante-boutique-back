const categorieService = require('../../services/admin/categorie.service');
const { paginate } = require('../../utils/paginate');
const { success } = require('../../utils/formatResponse');

async function create(req, res, next) {
  try {
    const categorie = await categorieService.createCategorie(req.body, req.file);
    return success(res, categorie, 'Catégorie créée', 201);
  } catch (err) {
    next(err);
  }
}

async function getAll(req, res, next) {
  try {
    const pagination = paginate(req.query);
    const result = await categorieService.getAllCategories(pagination);
    return success(res, result, 'Catégories récupérées');
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const categorie = await categorieService.getCategorieById(req.params.id);
    return success(res, categorie, 'Catégorie récupérée');
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const categorie = await categorieService.updateCategorie(req.params.id, req.body, req.file);
    return success(res, categorie, 'Catégorie mise à jour');
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await categorieService.deleteCategorie(req.params.id);
    return success(res, null, result.message);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getAll, getOne, update, remove };
