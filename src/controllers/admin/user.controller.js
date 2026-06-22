const userService = require('../../services/admin/user.service');
const { success, created, error } = require('../../utils/response');

const getAllUsers = async (req, res) => {
  try {
    const result = await userService.getAllUsers(req.query);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return success(res, user);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return success(res, user, 'Utilisateur mis à jour');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    return success(res, null, 'Utilisateur supprimé');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const toggleStatus = async (req, res) => {
  try {
    const result = await userService.toggleStatus(req.params.id);
    return success(res, result, 'Statut modifié');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, toggleStatus };
