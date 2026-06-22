const categoryService = require('../../services/admin/category.service');
const { success, created, error } = require('../../utils/response');

const getAllCategories = async (req, res) => {
  try {
    const cats = await categoryService.getAllCategories();
    return success(res, cats);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getCategoryById = async (req, res) => {
  try {
    const cat = await categoryService.getCategoryById(req.params.id);
    return success(res, cat);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const createCategory = async (req, res) => {
  try {
    const cat = await categoryService.createCategory(req.body, req.file);
    return created(res, cat, 'Catégorie créée');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const updateCategory = async (req, res) => {
  try {
    const cat = await categoryService.updateCategory(req.params.id, req.body, req.file);
    return success(res, cat, 'Catégorie mise à jour');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const deleteCategory = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    return success(res, null, 'Catégorie supprimée');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
