/**
 * Profil Controller (Client)
 * Gère le profil utilisateur, l'avatar et les adresses
 */
const ProfilService = require('../../services/client/profil.service');
const formatUser = require('../../utils/formatUser');
const ApiResponse = require('../../utils/ApiResponse');
const logger = require('../../config/logger');

/**
 * GET /api/profile (protégé)
 * Récupérer mon profil utilisateur
 */
exports.get = async (req, res) => {
  try {
    const result = await ProfilService.getProfil(req.user.id);
    if (!result.success) {
      return ApiResponse.notFound(res, result.message);
    }
    return ApiResponse.success(200, res, 'Profil récupéré', {
      user: formatUser(result.user),
    });
  } catch (err) {
    logger.error('Erreur getProfil', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * PUT /api/profile (protégé)
 * Mettre à jour mon profil (nom, prénom, téléphone, etc)
 */
exports.update = async (req, res) => {
  try {
    const result = await ProfilService.updateProfil(req.user.id, req.body);
    if (!result.success) {
      return ApiResponse.notFound(res, result.message);
    }
    return ApiResponse.success(200, res, result.message, {
      user: formatUser(result.user),
    });
  } catch (err) {
    logger.error('Erreur updateProfil', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * PATCH /api/profile/avatar (protégé)
 * Mettre à jour mon avatar (upload sur Cloudinary)
 */
exports.updateAvatar = async (req, res) => {
  try {
    const result = await ProfilService.updateAvatar(req.user.id, req.file);
    if (!result.success) {
      return ApiResponse.badRequest(res, result.message);
    }
    return ApiResponse.success(200, res, result.message, {
      avatar: result.avatar,
    });
  } catch (err) {
    logger.error('Erreur updateAvatar', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * GET /api/profile/adresses (protégé)
 * Récupérer mes adresses de livraison
 */
exports.getAdresses = async (req, res) => {
  try {
    const result = await ProfilService.getAdresses(req.user.id);
    return ApiResponse.success(200, res, 'Adresses récupérées', {
      adresses: result.adresses,
    });
  } catch (err) {
    logger.error('Erreur getAdresses', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * POST /api/profile/adresses (protégé)
 * Ajouter une nouvelle adresse (max 5)
 */
exports.ajouterAdresse = async (req, res) => {
  try {
    const result = await ProfilService.ajouterAdresse(req.user.id, req.body);
    if (!result.success) {
      return ApiResponse.badRequest(res, result.message);
    }
    return ApiResponse.success(201, res, result.message, {
      adresse: result.adresse,
    });
  } catch (err) {
    logger.error('Erreur ajouterAdresse', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * PUT /api/profile/adresses/:id (protégé)
 * Mettre à jour une adresse
 */
exports.updateAdresse = async (req, res) => {
  try {
    const result = await ProfilService.updateAdresse(req.user.id, req.params.id, req.body);
    if (!result.success) {
      return ApiResponse.notFound(res, result.message);
    }
    return ApiResponse.success(200, res, result.message, {
      adresse: result.adresse,
    });
  } catch (err) {
    logger.error('Erreur updateAdresse', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * DELETE /api/profile/adresses/:id (protégé)
 * Supprimer une adresse
 */
exports.supprimerAdresse = async (req, res) => {
  try {
    const result = await ProfilService.supprimerAdresse(req.user.id, req.params.id);
    if (!result.success) {
      if (result.status === 409) return ApiResponse.conflict(res, result.message);
      return ApiResponse.notFound(res, result.message);
    }
    return ApiResponse.success(200, res, result.message);
  } catch (err) {
    logger.error('Erreur supprimerAdresse', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * PATCH /api/profile/adresses/:id/default (protégé)
 * Définir une adresse comme adresse par défaut
 */
exports.setDefault = async (req, res) => {
  try {
    const result = await ProfilService.setAdresseDefault(req.user.id, req.params.id);
    if (!result.success) {
      return ApiResponse.notFound(res, result.message);
    }
    return ApiResponse.success(200, res, result.message, {
      adresse: result.adresse,
    });
  } catch (err) {
    logger.error('Erreur setAdresseDefault', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};
