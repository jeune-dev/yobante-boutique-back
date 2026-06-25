const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { jwtConfig, bcryptConfig } = require('../config/security');
const { User, UserOtp, RefreshToken } = require('../models');
const mailer = require('../utils/mailer');

function normalizeUser(user) {
  const normalized = user.toJSON ? user.toJSON() : { ...user };
  delete normalized.password;
  return normalized;
}

function generateAccessToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user.id, type: 'refresh' }, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });
}

function createOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hashValue(value) {
  return bcrypt.hash(value, bcryptConfig.saltRounds);
}

async function compareValue(value, hashed) {
  return bcrypt.compare(value, hashed);
}

async function register(data) {
  const existingUser = await User.findOne({ where: { email: data.email } });
  if (existingUser) {
    const error = new Error('Cet email est déjà utilisé');
    error.status = 409;
    throw error;
  }

  const passwordHash = await hashValue(data.password);
  const user = await User.create({
    nom: data.nom,
    prenom: data.prenom,
    email: data.email,
    password: passwordHash,
    telephone: data.telephone || null,
    isVerified: false,
    role: 'client',
  });

  const code = createOtpCode();
  const otpHash = await hashValue(code);
  await UserOtp.create({
    userId: user.id,
    code: otpHash,
    type: 'email_verification',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await mailer.sendOtpEmail(user.email, code);

  return normalizeUser(user);
}

async function verifyEmail(userId, email, code) {
  const user = userId
    ? await User.findByPk(userId)
    : await User.findOne({ where: { email } });

  if (!user) {
    const error = new Error('Utilisateur introuvable');
    error.status = 404;
    throw error;
  }

  const otp = await UserOtp.findOne({
    where: {
      userId: user.id,
      type: 'email_verification',
      isUsed: false,
      expiresAt: { [Op.gt]: new Date() },
    },
    order: [['createdAt', 'DESC']],
  });

  if (!otp) {
    const error = new Error('Code de vérification invalide ou expiré');
    error.status = 400;
    throw error;
  }

  const match = await compareValue(code, otp.code);
  if (!match) {
    const error = new Error('Code de vérification incorrect');
    error.status = 400;
    throw error;
  }

  user.isVerified = true;
  await user.save();
  otp.isUsed = true;
  await otp.save();

  return { message: 'Email vérifié avec succès' };
}

async function login(email, password) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const error = new Error('Identifiants invalides');
    error.status = 401;
    throw error;
  }

  if (!user.isActive || !user.isVerified) {
    const error = new Error('Compte inactif ou non vérifié');
    error.status = 401;
    throw error;
  }

  const match = await compareValue(password, user.password);
  if (!match) {
    const error = new Error('Identifiants invalides');
    error.status = 401;
    throw error;
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const refreshTokenHash = await hashValue(refreshToken);
  await RefreshToken.create({
    userId: user.id,
    token: refreshTokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken, user: normalizeUser(user) };
}

async function refreshToken(token) {
  if (!token) {
    const error = new Error('Token de rafraîchissement manquant');
    error.status = 401;
    throw error;
  }

  let payload;
  try {
    payload = jwt.verify(token, jwtConfig.refreshSecret);
  } catch (err) {
    const error = new Error('Token invalide ou expiré');
    error.status = 401;
    throw error;
  }

  if (payload.type !== 'refresh') {
    const error = new Error('Token de rafraîchissement invalide');
    error.status = 401;
    throw error;
  }

  const tokens = await RefreshToken.findAll({
    where: {
      userId: payload.id,
      expiresAt: { [Op.gt]: new Date() },
    },
  });

  const matchingToken = await Promise.all(
    tokens.map(async (savedToken) => {
      const match = await compareValue(token, savedToken.token);
      return match ? savedToken : null;
    })
  ).then((results) => results.find((item) => item));

  if (!matchingToken) {
    const error = new Error('Token de rafraîchissement introuvable');
    error.status = 401;
    throw error;
  }

  const user = await User.findByPk(payload.id);
  if (!user || !user.isActive) {
    const error = new Error('Utilisateur introuvable ou inactif');
    error.status = 401;
    throw error;
  }

  const accessToken = generateAccessToken(user);
  return { accessToken };
}

async function logout(userId, token) {
  if (!token) {
    return { message: 'Déconnexion effectuée' };
  }

  let payload;
  try {
    payload = jwt.verify(token, jwtConfig.refreshSecret);
  } catch (err) {
    return { message: 'Déconnexion effectuée' };
  }

  const refreshTokens = await RefreshToken.findAll({ where: { userId: userId || payload.id } });
  for (const savedToken of refreshTokens) {
    const match = await compareValue(token, savedToken.token);
    if (match) {
      await savedToken.destroy();
      break;
    }
  }

  return { message: 'Déconnexion effectuée' };
}

async function forgotPassword(email) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return { message: 'Si cet email existe, un code de réinitialisation a été envoyé.' };
  }

  const code = createOtpCode();
  const otpHash = await hashValue(code);
  await UserOtp.create({
    userId: user.id,
    code: otpHash,
    type: 'reset_password',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await mailer.sendResetPasswordEmail(user.email, code);
  return { message: 'Si cet email existe, un code de réinitialisation a été envoyé.' };
}

async function resetPassword(userId, email, code, newPassword) {
  const user = userId
    ? await User.findByPk(userId)
    : await User.findOne({ where: { email } });

  if (!user) {
    const error = new Error('Utilisateur introuvable');
    error.status = 404;
    throw error;
  }

  const otp = await UserOtp.findOne({
    where: {
      userId: user.id,
      type: 'reset_password',
      isUsed: false,
      expiresAt: { [Op.gt]: new Date() },
    },
    order: [['createdAt', 'DESC']],
  });

  if (!otp) {
    const error = new Error('Code de réinitialisation invalide ou expiré');
    error.status = 400;
    throw error;
  }

  const match = await compareValue(code, otp.code);
  if (!match) {
    const error = new Error('Code de réinitialisation incorrect');
    error.status = 400;
    throw error;
  }

  user.password = await hashValue(newPassword);
  await user.save();
  otp.isUsed = true;
  await otp.save();
  await RefreshToken.destroy({ where: { userId: user.id } });

  return { message: 'Mot de passe réinitialisé avec succès' };
}

async function changePassword(userId, oldPassword, newPassword) {
  const user = await User.findByPk(userId);
  if (!user) {
    const error = new Error('Utilisateur introuvable');
    error.status = 404;
    throw error;
  }

  const match = await compareValue(oldPassword, user.password);
  if (!match) {
    const error = new Error('Ancien mot de passe incorrect');
    error.status = 400;
    throw error;
  }

  user.password = await hashValue(newPassword);
  await user.save();
  await RefreshToken.destroy({ where: { userId: user.id } });

  return { message: 'Mot de passe modifié avec succès' };
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
