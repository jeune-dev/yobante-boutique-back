const profilService = require('../../services/client/profil.service');
const { success } = require('../../utils/formatResponse');

async function get(req, res, next) {
  try {
    const profil = await profilService.getProfil(req.user.id);
    return success(res, profil, 'Profil récupéré');
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const profil = await profilService.updateProfil(req.user.id, req.body);
    return success(res, profil, 'Profil mis à jour');
  } catch (err) {
    next(err);
  }
}

async function updateAvatar(req, res, next) {
  try {
    const result = await profilService.updateAvatar(req.user.id, req.file);
    return success(res, result, 'Avatar mis à jour');
  } catch (err) {
    next(err);
  }
}

async function getAdresses(req, res, next) {
  try {
    const adresses = await profilService.getAdresses(req.user.id);
    return success(res, adresses, 'Adresses récupérées');
  } catch (err) {
    next(err);
  }
}

async function ajouterAdresse(req, res, next) {
  try {
    const adresse = await profilService.ajouterAdresse(req.user.id, req.body);
    return success(res, adresse, 'Adresse créée', 201);
  } catch (err) {
    next(err);
  }
}

async function updateAdresse(req, res, next) {
  try {
    const adresse = await profilService.updateAdresse(req.user.id, req.params.id, req.body);
    return success(res, adresse, 'Adresse mise à jour');
  } catch (err) {
    next(err);
  }
}

async function supprimerAdresse(req, res, next) {
  try {
    const result = await profilService.supprimerAdresse(req.user.id, req.params.id);
    return success(res, null, result.message);
  } catch (err) {
    next(err);
  }
}

async function setDefault(req, res, next) {
  try {
    const adresse = await profilService.setAdresseDefault(req.user.id, req.params.id);
    return success(res, adresse, 'Adresse par défaut définie');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  get,
  update,
  updateAvatar,
  getAdresses,
  ajouterAdresse,
  updateAdresse,
  supprimerAdresse,
  setDefault,
};
