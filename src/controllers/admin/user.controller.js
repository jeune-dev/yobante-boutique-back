// ─────────────────────────────────────────────────────────────
// controllers/admin/user.controller.js
// ─────────────────────────────────────────────────────────────
const GestionAdminService = require('../../services/admin/admin.service');
const GestionUserService = require('../../services/admin/user.service');
const ApiResponse = require('../../utils/ApiResponse');
const logger = require('../../config/logger');
const formatUser = require('../../utils/formatUser');

// ──────────────────────────── ADMINS ───────────────────────────────────────

exports.listeAdmins = async (req, res) => {
  try {
    const result = await GestionAdminService.listerAdmins({ page: req.query.page, limit: req.query.limit });
    return ApiResponse.success(200, res, result.message, {
      admins: result.admins.map(formatUser),
      pagination: result.pagination,
    });
  } catch (err) {
    logger.error('Erreur dans listeAdmins :', err);
    return ApiResponse.internalServerError(res, 'Une erreur est survenue lors de la récupération des admins');
  }
};

exports.ajouterAdmin = async (req, res) => {
  const { nom, prenom, email, password, telephone } = req.body;

  try {
    const result = await GestionAdminService.ajouterAdmin({ nom, prenom, email, password, telephone });

    if (!result.success) {
      return ApiResponse.badRequest(res, result.message);
    }

    return ApiResponse.success(201, res, result.message, { admin: formatUser(result.admin) });
  } catch (err) {
    logger.error('Erreur dans ajouterAdmin :', err);
    return ApiResponse.internalServerError(res, "Erreur serveur lors de la création de l'admin");
  }
};

exports.supprimerAdmin = async (req, res) => {
  try {
    const result = await GestionAdminService.supprimerAdmin(req.params.id);
    if (!result.success) {
      return ApiResponse.notFound(res, result.message);
    }
    return ApiResponse.success(200, res, result.message);
  } catch (err) {
    logger.error('Erreur dans supprimerAdmin :', err);
    return ApiResponse.internalServerError(res, "Erreur serveur lors de la suppression de l'admin");
  }
};

exports.modifierAdmin = async (req, res) => {
  const { nom, prenom, telephone } = req.body;

  try {
    const result = await GestionAdminService.modifierAdmin(req.params.id, { nom, prenom, telephone });
    if (!result.success) {
      return ApiResponse.notFound(res, result.message);
    }
    return ApiResponse.success(200, res, result.message, { admin: formatUser(result.admin) });
  } catch (err) {
    logger.error('Erreur dans modifierAdmin :', err);
    return ApiResponse.internalServerError(res, "Erreur serveur lors de la modification de l'admin");
  }
};

exports.toggleActivationAdmin = async (req, res) => {
  try {
    const result = await GestionAdminService.toggleActivationAdmin(req.params.id);
    if (!result.success) {
      return ApiResponse.notFound(res, result.message);
    }
    return ApiResponse.success(200, res, result.message, { admin: formatUser(result.admin) });
  } catch (err) {
    logger.error('Erreur dans toggleActivationAdmin :', err);
    return ApiResponse.internalServerError(res, "Erreur serveur lors du changement de statut de l'admin");
  }
};

// ──────────────────────────── CLIENTS ──────────────────────────────────────

exports.listeClients = async (req, res) => {
  try {
    const result = await GestionUserService.listerClients({ page: req.query.page, limit: req.query.limit });
    return ApiResponse.success(200, res, result.message, {
      clients: result.clients.map(formatUser),
      pagination: result.pagination,
    });
  } catch (err) {
    logger.error('Erreur dans listeClients :', err);
    return ApiResponse.internalServerError(res, 'Une erreur est survenue lors de la récupération des clients');
  }
};

exports.nombreClients = async (req, res) => {
  try {
    const result = await GestionUserService.nombreClients();
    return ApiResponse.success(200, res, result.message, { totalClients: result.totalClients });
  } catch (err) {
    logger.error('Erreur dans nombreClients :', err);
    return ApiResponse.internalServerError(res, 'Une erreur est survenue lors du comptage des clients');
  }
};

exports.exportClients = async (req, res) => {
  try {
    const result = await GestionUserService.exportUsers();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="clients-${Date.now()}.csv"`);
    return res.status(200).send(result.csv);
  } catch (err) {
    logger.error('Erreur export clients :', err);
    return ApiResponse.internalServerError(res, "Erreur serveur lors de l'export des clients");
  }
};

exports.activerClient = async (req, res) => {
  try {
    const result = await GestionUserService.activerUser(req.params.id);
    if (!result.success) {
      return ApiResponse.notFound(res, result.message);
    }
    return ApiResponse.success(200, res, result.message, { client: formatUser(result.user) });
  } catch (err) {
    logger.error('Erreur dans activerClient :', err);
    return ApiResponse.internalServerError(res, "Erreur serveur lors de l'activation du client");
  }
};

exports.desactiverClient = async (req, res) => {
  try {
    const result = await GestionUserService.desactiverUser(req.params.id);
    if (!result.success) {
      return ApiResponse.notFound(res, result.message);
    }
    return ApiResponse.success(200, res, result.message, { client: formatUser(result.user) });
  } catch (err) {
    logger.error('Erreur dans desactiverClient :', err);
    return ApiResponse.internalServerError(res, "Erreur serveur lors de la désactivation du client");
  }
};
