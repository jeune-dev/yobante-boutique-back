const profileService = require('../services/profile.service');
const { success, error } = require('../utils/response');

const getProfile = async (req, res) => {
  try {
    const user = await profileService.getProfile(req.user.id);
    return success(res, user);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await profileService.updateProfile(req.user.id, req.body, req.file);
    return success(res, user, 'Profil mis à jour');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const changePassword = async (req, res) => {
  try {
    await profileService.changePassword(req.user.id, req.body);
    return success(res, null, 'Mot de passe modifié avec succès');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { getProfile, updateProfile, changePassword };
