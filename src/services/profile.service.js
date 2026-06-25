const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { bcryptConfig } = require('../config/security');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middlewares/uploadService');

const SAFE_ATTRS = { exclude: ['motDePasse', 'tokenRafraichissement', 'tokenReinitialisation', 'expirationReinitialisation'] };

const getProfile = async (userId) => {
  const user = await User.findByPk(userId, { attributes: SAFE_ATTRS });
  if (!user) throw { status: 404, message: 'Utilisateur introuvable' };
  return user;
};

const updateProfile = async (userId, { nom, prenom }, file) => {
  const user = await User.findByPk(userId);
  if (!user) throw { status: 404, message: 'Utilisateur introuvable' };

  const updates = {};
  if (nom)    updates.nom    = nom;
  if (prenom) updates.prenom = prenom;

  if (file) {
    if (user.avatarIdPublic) await deleteFromCloudinary(user.avatarIdPublic).catch(() => {});
    const result = await uploadToCloudinary(file.buffer, 'yobante/avatars');
    updates.avatar        = result.secure_url;
    updates.avatarIdPublic = result.public_id;
  }

  await user.update(updates);
  const { motDePasse, tokenRafraichissement, tokenReinitialisation, expirationReinitialisation, ...safe } = user.toJSON();
  return safe;
};

const changePassword = async (userId, { ancienPassword, nouveauPassword }) => {
  const user = await User.findByPk(userId);
  if (!user) throw { status: 404, message: 'Utilisateur introuvable' };

  const valid = await bcrypt.compare(ancienPassword, user.motDePasse);
  if (!valid) throw { status: 400, message: 'Ancien mot de passe incorrect' };

  const hash = await bcrypt.hash(nouveauPassword, bcryptConfig.saltRounds);
  await user.update({ motDePasse: hash, tokenRafraichissement: null });
};

module.exports = { getProfile, updateProfile, changePassword };
