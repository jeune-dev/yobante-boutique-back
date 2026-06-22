const authService = require('../services/auth.service');
const { success, created, error } = require('../utils/response');

const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    return created(res, result, 'Compte créé avec succès');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return success(res, { user: result.user, accessToken: result.accessToken }, 'Connexion réussie');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const refreshToken = async (req, res) => {
  try {
    const token  = req.cookies?.refreshToken || req.body.refreshToken;
    const tokens = await authService.refreshToken(token);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return success(res, { accessToken: tokens.accessToken }, 'Token rafraîchi');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const logout = async (req, res) => {
  try {
    await authService.logout(req.user.id);
    res.clearCookie('refreshToken');
    return success(res, null, 'Déconnexion réussie');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const token = await authService.forgotPassword(req.body.email);
    const data  = process.env.NODE_ENV !== 'production' ? { resetToken: token } : null;
    return success(res, data, 'Si cet email existe, un lien de réinitialisation a été envoyé');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const resetPassword = async (req, res) => {
  try {
    await authService.resetPassword(req.body);
    return success(res, null, 'Mot de passe réinitialisé avec succès');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { register, login, refreshToken, logout, forgotPassword, resetPassword };
