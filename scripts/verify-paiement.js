/**
 * Vérifie le cycle de paiement d'une commande, en HTTP réel.
 *
 * Couvre le chemin nominal (initiation → callback → commande validée), les
 * refus, le paiement à la livraison, l'idempotence du callback et le
 * cloisonnement entre clients.
 *
 * Usage : node scripts/verify-paiement.js — base de DEV uniquement.
 */
require('dotenv').config();
process.env.PAIEMENT_MODE = 'simulation';
process.env.PAIEMENT_SIMULATION_SECRET =
  process.env.PAIEMENT_SIMULATION_SECRET || 'secret-de-test';

const request = require('supertest');
const jwt = require('jsonwebtoken');

const sequelize = require('../src/config/db');
const app = require('../src/app');
const { jwtConfig } = require('../src/config/security');
const {
  User,
  Categorie,
  Produit,
  Adresse,
  Commande,
  Paiement,
} = require('../src/models');
const { ROLES, STATUT_COMMANDE, STATUT_PAIEMENT, METHODE_PAIEMENT } = require('../src/constants');

const SUFFIXE = `paie-${Date.now()}`;
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
  const [client, autreClient, vendeur] = await Promise.all([
    User.create({ nom: 'A', prenom: 'Client', email: `a-${SUFFIXE}@t.co`, password: motDePasse, role: ROLES.CLIENT }),
    User.create({ nom: 'B', prenom: 'Client', email: `b-${SUFFIXE}@t.co`, password: motDePasse, role: ROLES.CLIENT }),
    User.create({ nom: 'V', prenom: 'Vendeur', email: `v-${SUFFIXE}@t.co`, password: motDePasse, role: ROLES.VENDEUR }),
  ]);

  const categorie = await Categorie.create({ nom: `Cat ${SUFFIXE}`, slug: `cat-${SUFFIXE}` });
  await Produit.create({
    nom: `Produit ${SUFFIXE}`,
    slug: `produit-${SUFFIXE}`,
    prix: 5000,
    stock: 20,
    categorieId: categorie.id,
    vendeurId: vendeur.id,
    isActive: true,
  });

  const adresse = await Adresse.create({
    userId: client.id,
    nomComplet: 'Client Test',
    telephone: '770000000',
    rue: 'Rue 1',
    ville: 'Dakar',
    pays: 'SN',
  });

  const token = (u) =>
    jwt.sign({ id: u.id, role: u.role, isActive: true }, jwtConfig.secret, { expiresIn: '1h' });

  const creerCommande = async (methode) => {
    const commande = await Commande.create({
      reference: `${methode}-${SUFFIXE}-${Math.random().toString(16).slice(2, 6)}`,
      userId: client.id,
      adresseId: adresse.id,
      statut: STATUT_COMMANDE.EN_ATTENTE,
      montantTotal: 5000,
    });
    await Paiement.create({
      commandeId: commande.id,
      userId: client.id,
      montant: 5000,
      methode,
      statut: STATUT_PAIEMENT.EN_ATTENTE,
    });
    return commande;
  };

  const enTantQue = (u) => (m, url) => request(app)[m](url).set('Authorization', `Bearer ${token(u)}`);

  // ── Chemin nominal : Wave en simulation ───────────────────────────────────
  console.log('\n--- Paiement en ligne : initiation ---');
  const c1 = await creerCommande(METHODE_PAIEMENT.WAVE);
  const init = await enTantQue(client)('post', `/api/v1/commandes/${c1.id}/payer`);
  verifier('statut 200', init.status, 200);
  const paiement = init.body?.data?.paiement;
  verifier('référence retournée', typeof paiement?.reference === 'string', true);
  verifier('URL de paiement retournée', (paiement?.urlPaiement || '').includes('/simulation/'), true);
  verifier('paiement en attente', paiement?.statut, STATUT_PAIEMENT.EN_ATTENTE);

  const ref = paiement.reference;

  console.log('\n--- Sécurité du callback ---');
  const sansSignature = await request(app)
    .post('/api/v1/paiements/callback')
    .send({ reference: ref, succes: true });
  verifier('callback sans signature rejeté', sansSignature.status, 401);

  const mauvaiseSignature = await request(app)
    .post('/api/v1/paiements/callback')
    .set('x-paiement-signature', 'mauvais-secret')
    .send({ reference: ref, succes: true });
  verifier('callback mal signé rejeté', mauvaiseSignature.status, 401);

  const apresRejet = await Paiement.findOne({ where: { transactionId: ref } });
  verifier('paiement inchangé après rejet', apresRejet.statut, STATUT_PAIEMENT.EN_ATTENTE);

  console.log('\n--- Callback authentique ---');
  const okCallback = await request(app)
    .post('/api/v1/paiements/callback')
    .set('x-paiement-signature', process.env.PAIEMENT_SIMULATION_SECRET)
    .send({ reference: ref, succes: true });
  verifier('callback accepté', okCallback.status, 200);

  const paye = await Paiement.findOne({ where: { transactionId: ref } });
  verifier('paiement en succès', paye.statut, STATUT_PAIEMENT.SUCCES);
  verifier('date de paiement renseignée', paye.payeAt !== null, true);
  const c1Maj = await Commande.findByPk(c1.id);
  verifier('commande validée', c1Maj.statut, STATUT_COMMANDE.VALIDEE);

  console.log('\n--- Idempotence et rejeu ---');
  const rejeu = await request(app)
    .post('/api/v1/paiements/callback')
    .set('x-paiement-signature', process.env.PAIEMENT_SIMULATION_SECRET)
    .send({ reference: ref, succes: false });
  verifier('rejeu accepté sans erreur', rejeu.status, 200);
  const apresRejeu = await Paiement.findOne({ where: { transactionId: ref } });
  verifier('un paiement abouti ne régresse pas', apresRejeu.statut, STATUT_PAIEMENT.SUCCES);

  const repaiement = await enTantQue(client)('post', `/api/v1/commandes/${c1.id}/payer`);
  verifier('repayer une commande payée refusé', repaiement.status, 409);

  // ── Refus ────────────────────────────────────────────────────────────────
  console.log('\n--- Paiement refusé ---');
  const c2 = await creerCommande(METHODE_PAIEMENT.ORANGE_MONEY);
  const init2 = await enTantQue(client)('post', `/api/v1/commandes/${c2.id}/payer`);
  const ref2 = init2.body.data.paiement.reference;
  await request(app)
    .post('/api/v1/paiements/callback')
    .set('x-paiement-signature', process.env.PAIEMENT_SIMULATION_SECRET)
    .send({ reference: ref2, succes: false });
  const echoue = await Paiement.findOne({ where: { transactionId: ref2 } });
  verifier('paiement en échec', echoue.statut, STATUT_PAIEMENT.ECHOUE);
  const c2Maj = await Commande.findByPk(c2.id);
  verifier('commande reste en attente', c2Maj.statut, STATUT_COMMANDE.EN_ATTENTE);

  const reessai = await enTantQue(client)('post', `/api/v1/commandes/${c2.id}/payer`);
  verifier('réessai possible après échec', reessai.status, 200);

  // ── Paiement à la livraison ──────────────────────────────────────────────
  console.log('\n--- Paiement à la livraison ---');
  const c3 = await creerCommande(METHODE_PAIEMENT.CASH_LIVRAISON);
  const cash = await enTantQue(client)('post', `/api/v1/commandes/${c3.id}/payer`);
  verifier('statut 200', cash.status, 200);
  verifier('aucune URL à ouvrir', cash.body.data.paiement.urlPaiement, null);
  const c3Maj = await Commande.findByPk(c3.id);
  verifier('commande validée sans encaissement', c3Maj.statut, STATUT_COMMANDE.VALIDEE);
  const paiementCash = await Paiement.findOne({ where: { commandeId: c3.id } });
  verifier('paiement encore en attente', paiementCash.statut, STATUT_PAIEMENT.EN_ATTENTE);

  // ── Cloisonnement ────────────────────────────────────────────────────────
  console.log('\n--- Cloisonnement entre clients ---');
  const intrus = await enTantQue(autreClient)('post', `/api/v1/commandes/${c2.id}/payer`);
  verifier('un autre client ne peut pas payer', intrus.status, 404);
  const intrusStatut = await enTantQue(autreClient)('get', `/api/v1/commandes/${c2.id}/paiement`);
  verifier('ni consulter le paiement', intrusStatut.status, 404);

  // ── Commande annulée ─────────────────────────────────────────────────────
  console.log('\n--- Commande annulée ---');
  const c4 = await creerCommande(METHODE_PAIEMENT.WAVE);
  await c4.update({ statut: STATUT_COMMANDE.ANNULEE });
  const annulee = await enTantQue(client)('post', `/api/v1/commandes/${c4.id}/payer`);
  verifier('payer une commande annulée refusé', annulee.status, 400);

  // ── Statut lisible par le client ─────────────────────────────────────────
  console.log('\n--- Consultation du statut ---');
  const statut = await enTantQue(client)('get', `/api/v1/commandes/${c1.id}/paiement`);
  verifier('statut 200', statut.status, 200);
  verifier('statut du paiement exposé', statut.body.data.paiement.statut, STATUT_PAIEMENT.SUCCES);
  verifier('statut de commande joint', statut.body.data.paiement.statutCommande, STATUT_COMMANDE.VALIDEE);

  // ── Page de simulation ───────────────────────────────────────────────────
  console.log('\n--- Page de simulation ---');
  const c5 = await creerCommande(METHODE_PAIEMENT.WAVE);
  const init5 = await enTantQue(client)('post', `/api/v1/commandes/${c5.id}/payer`);
  const ref5 = init5.body.data.paiement.reference;
  const page = await request(app).get(`/api/v1/paiements/simulation/${ref5}`);
  verifier('page accessible', page.status, 200);
  verifier('page signale la simulation', page.text.includes('simulation'), true);
  const confirmation = await request(app)
    .post(`/api/v1/paiements/simulation/${ref5}`)
    .type('form')
    .send({ succes: 'true' });
  verifier('confirmation acceptée', confirmation.status, 200);
  const paye5 = await Paiement.findOne({ where: { transactionId: ref5 } });
  verifier('paiement confirmé via la page', paye5.statut, STATUT_PAIEMENT.SUCCES);

  console.log(
    `\n${echecs === 0 ? 'Cycle de paiement conforme.' : `${echecs} vérification(s) en échec.`}`
  );
  await sequelize.close();
  process.exit(echecs ? 1 : 0);
}

main().catch(async (err) => {
  console.error('Erreur :', err.message, '\n', err.stack);
  await sequelize.close();
  process.exit(1);
});
