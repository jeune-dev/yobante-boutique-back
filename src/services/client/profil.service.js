const cloudinary = require('../../config/cloudinary');
const { User, Adresse } = require('../../models');

async function getProfil(userId) {
  const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });
  if (!user) {
    const error = new Error('Utilisateur introuvable');
    error.status = 404;
    throw error;
  }
  return user;
}

async function updateProfil(userId, data) {
  const user = await User.findByPk(userId);
  if (!user) {
    const error = new Error('Utilisateur introuvable');
    error.status = 404;
    throw error;
  }

  user.nom = data.nom || user.nom;
  user.prenom = data.prenom || user.prenom;
  user.telephone = data.telephone ?? user.telephone;
  await user.save();

  const updated = await User.findByPk(userId, { attributes: { exclude: ['password'] } });
  return updated;
}

async function updateAvatar(userId, file) {
  if (!file) {
    const error = new Error('Aucun fichier avatar reçu');
    error.status = 400;
    throw error;
  }

  const user = await User.findByPk(userId);
  if (!user) {
    const error = new Error('Utilisateur introuvable');
    error.status = 404;
    throw error;
  }

  if (user.avatar) {
    const publicId = user.avatar.split('/').pop().split('.')[0];
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      // ignore error if image already absent
    }
  }

  const result = await cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'yobante/profil' }, (error, uploaded) => {
    if (error) {
      throw error;
    }
    return uploaded;
  });

  const streamifier = require('streamifier');
  const uploadPromise = new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'yobante/profil' }, (error, uploaded) => {
      if (error) reject(error);
      else resolve(uploaded);
    });
    streamifier.createReadStream(file.buffer).pipe(stream);
  });

  const uploaded = await uploadPromise;
  user.avatar = uploaded.secure_url;
  await user.save();

  return { avatarUrl: user.avatar };
}

async function getAdresses(userId) {
  const adresses = await Adresse.findAll({
    where: { userId },
    order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
  });
  return adresses;
}

async function ajouterAdresse(userId, data) {
  const count = await Adresse.count({ where: { userId } });
  if (count >= 5) {
    const error = new Error('Nombre maximal d\'adresses atteint');
    error.status = 400;
    throw error;
  }

  if (data.isDefault) {
    await Adresse.update({ isDefault: false }, { where: { userId } });
  }

  const adresse = await Adresse.create({
    userId,
    nomComplet: data.nomComplet,
    telephone: data.telephone,
    rue: data.rue,
    ville: data.ville,
    region: data.region || null,
    pays: data.pays || 'Sénégal',
    codePostal: data.codePostal || null,
    isDefault: Boolean(data.isDefault),
  });

  return adresse;
}

async function updateAdresse(userId, adresseId, data) {
  const adresse = await Adresse.findOne({ where: { id: adresseId, userId } });
  if (!adresse) {
    const error = new Error('Adresse introuvable');
    error.status = 404;
    throw error;
  }

  if (data.isDefault) {
    await Adresse.update({ isDefault: false }, { where: { userId } });
  }

  adresse.nomComplet = data.nomComplet || adresse.nomComplet;
  adresse.telephone = data.telephone || adresse.telephone;
  adresse.rue = data.rue || adresse.rue;
  adresse.ville = data.ville || adresse.ville;
  adresse.region = data.region ?? adresse.region;
  adresse.pays = data.pays || adresse.pays;
  adresse.codePostal = data.codePostal ?? adresse.codePostal;
  adresse.isDefault = data.isDefault ?? adresse.isDefault;
  await adresse.save();

  return adresse;
}

async function supprimerAdresse(userId, adresseId) {
  const adresse = await Adresse.findOne({ where: { id: adresseId, userId } });
  if (!adresse) {
    const error = new Error('Adresse introuvable');
    error.status = 404;
    throw error;
  }

  await adresse.destroy();
  return { message: 'Adresse supprimée' };
}

async function setAdresseDefault(userId, adresseId) {
  const adresse = await Adresse.findOne({ where: { id: adresseId, userId } });
  if (!adresse) {
    const error = new Error('Adresse introuvable');
    error.status = 404;
    throw error;
  }

  await Adresse.update({ isDefault: false }, { where: { userId } });
  adresse.isDefault = true;
  await adresse.save();
  return adresse;
}

module.exports = {
  getProfil,
  updateProfil,
  updateAvatar,
  getAdresses,
  ajouterAdresse,
  updateAdresse,
  supprimerAdresse,
  setAdresseDefault,
};
