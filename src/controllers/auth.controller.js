/**
 * Auth Controller
 * Gère l'authentification et la gestion de compte
 */
const AuthService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const formatUser = require('../utils/formatUser');
const logger = require('../config/logger');

/**
 * POST /api/auth/register
 * Créer un nouveau compte utilisateur
 */
exports.register = async (req, res) => {
  const { nom, prenom, email, password, telephone, adresse } = req.body;

  try {
    const result = await AuthService.register({ nom, prenom, email, password, telephone, adresse });

    if (!result.success) {
      return ApiResponse.badRequest(res, result.message);
    }

    return ApiResponse.success(201, res, result.message, {
      user: formatUser(result.user),
    });
  } catch (err) {
    logger.error("Erreur lors de l'inscription", { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * POST /api/auth/login
 * Connexion avec email et mot de passe
 */
exports.login = async (req, res) => {
  const { identifiant, password } = req.body;

  if (!identifiant || !password) {
    return ApiResponse.badRequest(res, 'Identifiant et mot de passe obligatoires');
  }

  try {
    const result = await AuthService.login({ identifiant, password });

    if (!result.success) {
      return ApiResponse.badRequest(res, result.error || result.message);
    }

    return ApiResponse.success(200, res, result.message, {
      token: result.token,
      refreshToken: result.refreshToken,
      user: formatUser(result.user),
    });
  } catch (err) {
    logger.error('Erreur connexion', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * POST /api/auth/refresh
 * Renouveler le token d'accès avec un refresh token
 */
exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return ApiResponse.badRequest(res, 'refreshToken manquant');
  }

  try {
    const result = await AuthService.refresh({ refreshToken });

    if (!result.success) {
      return ApiResponse.unauthorized(res, result.error);
    }

    return ApiResponse.success(200, res, 'Token renouvelé', {
      token: result.token,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    logger.error('Erreur refresh token', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * POST /api/auth/logout
 * Déconnexion et revocation du refresh token
 */
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    await AuthService.logout({ refreshToken });
    return ApiResponse.success(200, res, 'Déconnexion réussie');
  } catch (err) {
    logger.error('Erreur logout', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * POST /api/auth/forgot-password
 * Demander un reset de mot de passe (envoi OTP par email)
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await AuthService.forgotPassword(email);
    return ApiResponse.success(200, res, result.message);
  } catch (err) {
    logger.error('Erreur forgotPassword', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * POST /api/auth/reset-password
 * Réinitialiser le mot de passe avec OTP
 */
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const result = await AuthService.resetPassword(email, otp, newPassword);

    if (!result.success) {
      return ApiResponse.badRequest(res, result.message);
    }

    return ApiResponse.success(200, res, result.message);
  } catch (err) {
    logger.error('Erreur resetPassword', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * POST /api/auth/change-password (protégé)
 * Changer le mot de passe (utilisateur authentifié)
 */
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const result = await AuthService.changePassword(req.user.id, oldPassword, newPassword);

    if (!result.success) {
      return ApiResponse.badRequest(res, result.message);
    }

    return ApiResponse.success(200, res, result.message);
  } catch (err) {
    logger.error('Erreur changePassword', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};
