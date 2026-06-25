const userService = require('../../services/admin/user.service');
const { paginate } = require('../../utils/paginate');
const { success } = require('../../utils/formatResponse');

async function getAll(req, res, next) {
  try {
    const pagination = paginate(req.query);
    const result = await userService.getAllUsers(req.query, pagination);
    return success(res, result, 'Utilisateurs récupérés');
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id);
    return success(res, user, 'Utilisateur récupéré');
  } catch (err) {
    next(err);
  }
}

async function toggleActive(req, res, next) {
  try {
    const user = await userService.toggleActive(req.params.id);
    return success(res, user, 'Statut actif inversé');
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await userService.deleteUser(req.params.id);
    return success(res, null, result.message);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, toggleActive, remove };

async function exportUsers(req, res, next) {
  try {
    const result = await userService.getAllUsers(req.query, { page: 1, limit: 10000, offset: 0 });
    return success(res, result.rows, 'Export utilisateurs');
  } catch (err) {
    next(err);
  }
}

async function bloquer(req, res, next) {
  try {
    const user = await userService.toggleActive(req.params.id);
    return success(res, user, 'Utilisateur bloqué/débloqué');
  } catch (err) {
    next(err);
  }
}

async function activer(req, res, next) {
  try {
    const user = await userService.toggleActive(req.params.id);
    return success(res, user, 'Utilisateur activé/désactivé');
  } catch (err) {
    next(err);
  }
}

module.exports.exportUsers = exportUsers;
module.exports.bloquer = bloquer;
module.exports.activer = activer;
