/**
 * Vérifie les notifications : émission sur évènements métier, compteur de
 * non-lues, marquage, enregistrement d'appareil et cloisonnement.
 *
 * Usage : node scripts/verify-notifications.js — base de DEV uniquement.
 */
require('dotenv').config();

const request = require('supertest');
const jwt = require('jsonwebtoken');

const sequelize = require('../src/config/db');
const app = require('../src/app');
const { jwtConfig } = require('../src/config/security');
const { User, Categorie, Produit, Notification, DeviceToken } = require('../src/models');
const NotificationService = require('../src/services/notification');
const AdminProduitService = require('../src/services/admin/produit.service');
const { ROLES, STATUT_VALIDATION_PRODUIT } = require('../src/constants');
const { nettoyerDonneesDeTest } = require('./_nettoyage');

const SUFFIXE = `notif-${Date.now()}`;
let echecs = 0;

function verifier(libelle, recu, attendu) {
  const ok = JSON.stringify(recu) === JSON.stringify(attendu);
  if (!ok) echecs++;
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} ${libelle.padEnd(50)} attendu ${JSON.stringify(attendu)} → reçu ${JSON.stringify(recu)}`
  );
}

async function main() {
  await sequelize.authenticate();
  await sequelize.sync();

  const motDePasse = 'x'.repeat(60);
  const [vendeur, autre] = await Promise.all([
    User.create({ nom: 'V', prenom: 'Vendeur', email: `v-${SUFFIXE}@t.co`, password: motDePasse, role: ROLES.VENDEUR }),
    User.create({ nom: 'A', prenom: 'Autre', email: `a-${SUFFIXE}@t.co`, password: motDePasse, role: ROLES.CLIENT }),
  ]);

  const token = (u) =>
    jwt.sign({ id: u.id, role: u.role, isActive: true }, jwtConfig.secret, { expiresIn: '1h' });
  const en = (u) => (m, url) => request(app)[m](url).set('Authorization', `Bearer ${token(u)}`);

  const categorie = await Categorie.create({ nom: `Cat ${SUFFIXE}`, slug: `cat-${SUFFIXE}` });
  const produit = await Produit.create({
    nom: `Produit ${SUFFIXE}`,
    slug: `produit-${SUFFIXE}`,
    prix: 1000,
    categorieId: categorie.id,
    vendeurId: vendeur.id,
    statutValidation: STATUT_VALIDATION_PRODUIT.VALIDE_STEP1,
  });

  // ── Émission sur évènement métier ────────────────────────────────────────
  console.log('\n--- Validation d une demande ---');
  await AdminProduitService.validerProduitStep2(produit.id);
  const apresValidation = await Notification.findAll({ where: { userId: vendeur.id } });
  verifier('le vendeur est notifié', apresValidation.length, 1);
  verifier('type de notification', apresValidation[0].type, 'produit');
  verifier('notification non lue', apresValidation[0].lu, false);
  verifier('contexte transmis', apresValidation[0].donnees.produitId, produit.id);

  console.log('\n--- Rejet d une demande ---');
  const produit2 = await Produit.create({
    nom: `Produit2 ${SUFFIXE}`,
    slug: `produit2-${SUFFIXE}`,
    prix: 1000,
    categorieId: categorie.id,
    vendeurId: vendeur.id,
    statutValidation: STATUT_VALIDATION_PRODUIT.EN_ATTENTE,
  });
  await AdminProduitService.rejeterProduit(produit2.id, 'Photos trop sombres');
  const rejets = await Notification.findAll({
    where: { userId: vendeur.id, type: 'produit' },
    order: [['createdAt', 'DESC']],
  });
  verifier('le motif figure dans le message', rejets[0].message.includes('Photos trop sombres'), true);

  // ── Compteur de non-lues ────────────────────────────────────────────────
  console.log('\n--- Compteur de la cloche ---');
  const compteur = await en(vendeur)('get', '/api/v1/notifications/non-lues');
  verifier('statut 200', compteur.status, 200);
  verifier('deux non-lues', compteur.body.data.total, 2);

  const vide = await en(autre)('get', '/api/v1/notifications/non-lues');
  verifier('un autre compte ne voit rien', vide.body.data.total, 0);

  // ── Liste ───────────────────────────────────────────────────────────────
  console.log('\n--- Liste ---');
  const liste = await en(vendeur)('get', '/api/v1/notifications');
  verifier('statut 200', liste.status, 200);
  verifier('deux notifications', liste.body.data.notifications.length, 2);
  verifier('la plus récente en tête', liste.body.data.notifications[0].titre, 'Demande rejetée');

  const listeAutre = await en(autre)('get', '/api/v1/notifications');
  verifier('cloisonnement de la liste', listeAutre.body.data.notifications.length, 0);

  // ── Marquage ────────────────────────────────────────────────────────────
  console.log('\n--- Marquage ---');
  const premiere = liste.body.data.notifications[0].id;
  const marque = await en(vendeur)('patch', `/api/v1/notifications/${premiere}/lire`);
  verifier('marquage accepté', marque.status, 200);
  const apresMarquage = await en(vendeur)('get', '/api/v1/notifications/non-lues');
  verifier('compteur décrémenté', apresMarquage.body.data.total, 1);

  const rejoue = await en(vendeur)('patch', `/api/v1/notifications/${premiere}/lire`);
  verifier('marquage idempotent', rejoue.status, 200);

  const intrus = await en(autre)('patch', `/api/v1/notifications/${premiere}/lire`);
  verifier('un autre compte ne peut pas marquer', intrus.status, 404);

  console.log('\n--- Tout marquer lu (ouverture de l app) ---');
  const tout = await en(vendeur)('patch', '/api/v1/notifications/toutes-lues');
  verifier('statut 200', tout.status, 200);
  const apresTout = await en(vendeur)('get', '/api/v1/notifications/non-lues');
  verifier('compteur à zéro', apresTout.body.data.total, 0);

  // ── Appareils ───────────────────────────────────────────────────────────
  console.log('\n--- Enregistrement d appareil ---');
  const enregistrement = await en(vendeur)('post', '/api/v1/device-token/register').send({
    token: `jeton-${SUFFIXE}`,
    plateforme: 'android',
  });
  verifier('appareil enregistré', enregistrement.status, 200);

  const doublon = await en(vendeur)('post', '/api/v1/device-token/register').send({
    token: `jeton-${SUFFIXE}`,
    plateforme: 'android',
  });
  verifier('réenregistrement sans doublon', doublon.status, 200);
  verifier(
    'un seul appareil en base',
    await DeviceToken.count({ where: { token: `jeton-${SUFFIXE}` } }),
    1
  );

  // Un même appareil qui change de compte doit être réattribué, pas dupliqué.
  await en(autre)('post', '/api/v1/device-token/register').send({ token: `jeton-${SUFFIXE}` });
  const reattribue = await DeviceToken.findOne({ where: { token: `jeton-${SUFFIXE}` } });
  verifier('appareil réattribué au nouveau compte', reattribue.userId, autre.id);

  const sansJeton = await en(vendeur)('post', '/api/v1/device-token/register').send({});
  verifier('jeton manquant refusé', sansJeton.status, 400);

  // ── L absence de push ne bloque rien ────────────────────────────────────
  console.log('\n--- Push non configuré ---');
  const creee = await NotificationService.creer({
    userId: vendeur.id,
    titre: 'Test',
    message: 'Message de test',
    type: 'test',
  });
  verifier('notification créée malgré FCM absent', creee.id !== undefined, true);

  console.log(
    `\n${echecs === 0 ? 'Notifications conformes.' : `${echecs} vérification(s) en échec.`}`
  );
  await nettoyerDonneesDeTest(SUFFIXE);
  await sequelize.close();
  process.exit(echecs ? 1 : 0);
}

main().catch(async (err) => {
  console.error('Erreur :', err.message, '\n', err.stack);
  await nettoyerDonneesDeTest(SUFFIXE);
  await sequelize.close();
  process.exit(1);
});
