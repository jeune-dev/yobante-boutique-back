'use strict';

const { Op } = require('sequelize');
const {
  BlocPromo,
  Promotion,
  Paiement,
  CommandeItem,
  Commande,
  Adresse,
  Produit,
  Categorie,
  ProfilVendeur,
  DeviceToken,
  Notification,
  User,
} = require('../src/models');

/**
 * Supprime tout ce qu'un script de vérification a créé.
 *
 * Chaque script travaille avec un suffixe unique (`verif-1784…`) qu'il appose
 * aux emails, slugs et références. On s'en sert pour retrouver ses traces.
 * Sans ce nettoyage, chaque exécution laissait des comptes, produits et
 * sous-sections fantômes qui finissaient par apparaître dans le dashboard.
 *
 * @param {string} suffixe le suffixe utilisé par le script appelant
 */
async function nettoyerDonneesDeTest(suffixe) {
  const motif = { [Op.like]: `%${suffixe}%` };

  // Ordre imposé par les clés étrangères : des feuilles vers les racines.
  const utilisateurs = await User.findAll({
    where: { email: motif },
    attributes: ['id'],
    raw: true,
  });
  const idsUtilisateurs = utilisateurs.map((u) => u.id);

  const commandes = await Commande.findAll({
    where: { reference: motif },
    attributes: ['id'],
    raw: true,
  });
  const idsCommandes = commandes.map((c) => c.id);

  if (idsCommandes.length) {
    await Paiement.destroy({ where: { commandeId: { [Op.in]: idsCommandes } } });
    await CommandeItem.destroy({ where: { commandeId: { [Op.in]: idsCommandes } } });
    await Commande.destroy({ where: { id: { [Op.in]: idsCommandes } } });
  }

  if (idsUtilisateurs.length) {
    await Paiement.destroy({ where: { userId: { [Op.in]: idsUtilisateurs } } });
    await Notification.destroy({ where: { userId: { [Op.in]: idsUtilisateurs } } });
    await DeviceToken.destroy({ where: { userId: { [Op.in]: idsUtilisateurs } } });
    await Adresse.destroy({ where: { userId: { [Op.in]: idsUtilisateurs } } });
    await ProfilVendeur.destroy({ where: { userId: { [Op.in]: idsUtilisateurs } } });
  }

  const produits = await Produit.findAll({
    where: { slug: motif },
    attributes: ['id'],
    raw: true,
  });
  const idsProduits = produits.map((p) => p.id);

  if (idsProduits.length) {
    await Promotion.destroy({ where: { produitId: { [Op.in]: idsProduits } } });
    await CommandeItem.destroy({ where: { produitId: { [Op.in]: idsProduits } } });
    await Produit.destroy({ where: { id: { [Op.in]: idsProduits } } });
  }

  await BlocPromo.destroy({ where: { titre: motif } });
  await Categorie.destroy({ where: { slug: motif } });
  if (idsUtilisateurs.length) {
    await User.destroy({ where: { id: { [Op.in]: idsUtilisateurs } } });
  }
}

module.exports = { nettoyerDonneesDeTest };
