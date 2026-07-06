const formatUser = (user) => ({
  id: user.id,
  nom: user.nom,
  prenom: user.prenom,
  email: user.email,
  telephone: user.telephone,
  role: user.role,
  isActive: user.isActive,
  isVerified: user.isVerified,
  avatar: user.avatar,
});

module.exports = formatUser;
