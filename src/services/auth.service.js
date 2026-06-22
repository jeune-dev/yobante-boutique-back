const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const { User } = require('../models');
const { jwtConfig, bcryptConfig } = require('../config/security');

const generateTokens = (user) => {
  const payload = { id: user.id, role: user.role };
  const accessToken  = jwt.sign(payload, jwtConfig.secret,        { expiresIn: jwtConfig.expiresIn });
  const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiresIn });
  return { accessToken, refreshToken };
};

const register = async ({ nom, prenom, email, password, role = 'client' }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw { status: 409, message: 'Cet email est déjà utilisé' };

  const hash = await bcrypt.hash(password, bcryptConfig.saltRounds);
  const user  = await User.create({ nom, prenom, email, motDePasse: hash, role });

  const tokens = generateTokens(user);
  await user.update({ tokenRafraichissement: tokens.refreshToken });

  return { user: sanitize(user), ...tokens };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw { status: 401, message: 'Email ou mot de passe incorrect' };
  if (!user.estActif) throw { status: 403, message: 'Compte désactivé' };

  const valid = await bcrypt.compare(password, user.motDePasse);
  if (!valid) throw { status: 401, message: 'Email ou mot de passe incorrect' };

  const tokens = generateTokens(user);
  await user.update({ tokenRafraichissement: tokens.refreshToken });

  return { user: sanitize(user), ...tokens };
};

const refreshToken = async (token) => {
  if (!token) throw { status: 401, message: 'Refresh token manquant' };
  try {
    const decoded = jwt.verify(token, jwtConfig.refreshSecret);
    const user    = await User.findByPk(decoded.id);
    if (!user || user.tokenRafraichissement !== token) throw new Error();
    if (!user.estActif) throw { status: 403, message: 'Compte désactivé' };

    const tokens = generateTokens(user);
    await user.update({ tokenRafraichissement: tokens.refreshToken });
    return tokens;
  } catch (err) {
    if (err.status) throw err;
    throw { status: 401, message: 'Refresh token invalide ou expiré' };
  }
};

const logout = async (userId) => {
  await User.update({ tokenRafraichissement: null }, { where: { id: userId } });
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) return;

  const token   = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await user.update({ tokenReinitialisation: token, expirationReinitialisation: expires });

  // TODO: envoyer l'email avec le lien de réinitialisation
  return token;
};

const resetPassword = async ({ token, password }) => {
  const user = await User.findOne({ where: { tokenReinitialisation: token } });
  if (!user || !user.expirationReinitialisation || user.expirationReinitialisation < new Date()) {
    throw { status: 400, message: 'Token invalide ou expiré' };
  }

  const hash = await bcrypt.hash(password, bcryptConfig.saltRounds);
  await user.update({
    motDePasse: hash,
    tokenReinitialisation: null,
    expirationReinitialisation: null,
    tokenRafraichissement: null,
  });
};

const sanitize = (user) => {
  const { motDePasse, tokenRafraichissement, tokenReinitialisation, expirationReinitialisation, ...safe } = user.toJSON();
  return safe;
};

module.exports = { register, login, refreshToken, logout, forgotPassword, resetPassword };
