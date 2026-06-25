const authService = require('../services/auth.service');
const { success, error } = require('../utils/formatResponse');
const { cookieConfig } = require('../config/security');

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    return success(res, user, 'Inscription réussie. Vérifiez votre email pour le code de validation.', 201);
  } catch (err) {
    next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const { userId, email, code } = req.body;
    const result = await authService.verifyEmail(userId, email, code);
    return success(res, null, result.message, 200);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.login(email, password);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: cookieConfig.secure,
      sameSite: cookieConfig.sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return success(res, { accessToken, user }, 'Connexion réussie');
  } catch (err) {
    next(err);
  }
}

async function refreshToken(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const tokenResult = await authService.refreshToken(refreshToken);
    return success(res, tokenResult, 'Token rafraîchi');
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    await authService.logout(req.user.id, refreshToken);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: cookieConfig.secure,
      sameSite: cookieConfig.sameSite,
    });
    return success(res, null, 'Déconnexion réussie');
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    return success(res, null, result.message);
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { userId, email, code, newPassword } = req.body;
    const result = await authService.resetPassword(userId, email, code, newPassword);
    return success(res, null, result.message);
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, oldPassword, newPassword);
    return success(res, null, result.message);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
};
