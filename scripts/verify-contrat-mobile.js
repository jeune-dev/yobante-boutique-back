/**
 * Vérifie que les réponses HTTP des routes vendeur ont exactement la forme
 * attendue par les modèles Dart de l'app mobile (VendeurVentesModel,
 * VendeurCommandeModel, stats produits).
 *
 * Une erreur de niveau d'imbrication (data.ventes vs data) ne casse rien côté
 * backend mais vide silencieusement le tableau de bord mobile : d'où ce test.
 *
 * Usage : node scripts/verify-contrat-mobile.js — base de DEV uniquement.
 */
require('dotenv').config();

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
  CommandeItem,
  ProfilVendeur,
} = require('../src/models');
const { STATUT_COMMANDE, STATUT_VALIDATION_PRODUIT, ROLES } = require('../src/constants');
const { nettoyerDonneesDeTest } = require('./_nettoyage');

const SUFFIXE = `contrat-${Date.now()}`;
let echecs = 0;

function verifier(libelle, condition, detail = '') {
  if (!condition) echecs++;
  console.log(`${condition ? 'OK  ' : 'FAIL'} ${libelle}${detail ? ` — ${detail}` : ''}`);
}

async function main() {
  await sequelize.authenticate();
  await sequelize.sync();

  const motDePasse = 'x'.repeat(60);
  const vendeur = await User.create({
    nom: 'Contrat',
    prenom: 'Vendeur',
    email: `v-${SUFFIXE}@t.co`,
    password: motDePasse,
    role: ROLES.VENDEUR,
  });
  // vendeurMiddleware exige un profil vendeur actif.
  await ProfilVendeur.create({
    userId: vendeur.id,
    nomBoutique: `Boutique ${SUFFIXE}`,
    isActive: true,
  });

  const client = await User.create({
    nom: 'Contrat',
    prenom: 'Client',
    email: `c-${SUFFIXE}@t.co`,
    password: motDePasse,
    role: ROLES.CLIENT,
  });

  const categorie = await Categorie.create({ nom: `Cat ${SUFFIXE}`, slug: `cat-${SUFFIXE}` });
  const produit = await Produit.create({
    nom: 'Produit contrat',
    slug: `produit-${SUFFIXE}`,
    prix: 2500,
    stock: 10,
    stockAlloue: 40,
    categorieId: categorie.id,
    vendeurId: vendeur.id,
    statutValidation: STATUT_VALIDATION_PRODUIT.VALIDE,
    isActive: true,
    images: ['https://example.test/img.jpg'],
  });

  const adresse = await Adresse.create({
    userId: client.id,
    nomComplet: 'Client Contrat',
    telephone: '770000000',
    rue: 'Rue 1',
    ville: 'Dakar',
    pays: 'SN',
  });

  const commande = await Commande.create({
    reference: `REF-${SUFFIXE}`,
    userId: client.id,
    adresseId: adresse.id,
    statut: STATUT_COMMANDE.LIVREE,
    montantTotal: 5000,
  });
  await CommandeItem.create({
    commandeId: commande.id,
    produitId: produit.id,
    quantite: 2,
    prixUnitaire: 2500,
    sousTotal: 5000,
  });

  const token = jwt.sign(
    { id: vendeur.id, role: ROLES.VENDEUR, isActive: true },
    jwtConfig.secret,
    { expiresIn: '1h' }
  );
  const appel = (url) =>
    request(app).get(url).set('Authorization', `Bearer ${token}`);

  // ── VendeurVentesModel lit data.ventes ────────────────────────────────
  console.log('\n--- GET /vendeur/commandes/ventes ---');
  const rVentes = await appel('/api/v1/vendeur/commandes/ventes');
  verifier('statut 200', rVentes.status === 200, `reçu ${rVentes.status}`);
  const ventes = rVentes.body?.data?.ventes;
  verifier('data.ventes présent', !!ventes);
  if (ventes) {
    for (const cle of [
      'chiffreAffaires',
      'unitesVendues',
      'nombreCommandes',
      'commandesATraiter',
      'periode',
      'topProduits',
      'parJour',
    ]) {
      verifier(`clé « ${cle} »`, ventes[cle] !== undefined);
    }
    verifier('chiffreAffaires numérique', typeof ventes.chiffreAffaires === 'number',
      `${JSON.stringify(ventes.chiffreAffaires)}`);
    verifier('periode.jours présent', ventes.periode?.jours !== undefined);
    verifier('topProduits[0].nom présent', ventes.topProduits?.[0]?.nom !== undefined);
    verifier('parJour[0].jour présent', ventes.parJour?.[0]?.jour !== undefined);
  }

  // ── VendeurCommandeModel lit data.commandes[] ─────────────────────────
  console.log('\n--- GET /vendeur/commandes ---');
  const rCmd = await appel('/api/v1/vendeur/commandes');
  verifier('statut 200', rCmd.status === 200, `reçu ${rCmd.status}`);
  const commandes = rCmd.body?.data?.commandes;
  verifier('data.commandes est un tableau', Array.isArray(commandes));
  const c0 = commandes?.[0];
  verifier('au moins une commande', !!c0);
  if (c0) {
    for (const cle of ['id', 'reference', 'statut', 'montantVendeur', 'createdAt', 'items']) {
      verifier(`clé « ${cle} »`, c0[cle] !== undefined);
    }
    verifier('montantTotal absent (fuite inter-vendeurs)', c0.montantTotal === undefined);
    verifier('user.prenom présent', c0.user?.prenom !== undefined);
    verifier('adresse.ville présent', c0.adresse?.ville !== undefined);
    verifier('items[0].produit.nom présent', c0.items?.[0]?.produit?.nom !== undefined);
    verifier('items[0].produit.images est un tableau',
      Array.isArray(c0.items?.[0]?.produit?.images));
    verifier('items[0].sousTotal présent', c0.items?.[0]?.sousTotal !== undefined);
  }

  // ── Compteurs catalogue : data.stats ──────────────────────────────────
  console.log('\n--- GET /vendeur/produits/stats ---');
  const rStats = await appel('/api/v1/vendeur/produits/stats');
  verifier('statut 200', rStats.status === 200, `reçu ${rStats.status}`);
  const stats = rStats.body?.data?.stats;
  verifier('data.stats présent', !!stats);
  if (stats) {
    for (const cle of ['total', 'valides', 'enAttente', 'rejetes', 'ruptureStock']) {
      verifier(`clé « ${cle} »`, stats[cle] !== undefined);
    }
  }

  // ── Liste produits filtrée par statut ─────────────────────────────────
  console.log('\n--- GET /vendeur/produits?statut=valide ---');
  const rProd = await appel('/api/v1/vendeur/produits?statut=valide');
  verifier('statut 200', rProd.status === 200, `reçu ${rProd.status}`);
  const produits = rProd.body?.data?.produits;
  verifier('data.produits est un tableau', Array.isArray(produits));
  verifier('statutValidation présent', produits?.[0]?.statutValidation !== undefined);
  verifier('stockAlloue présent', produits?.[0]?.stockAlloue !== undefined);

  // ── Catégories, pour le formulaire de demande ─────────────────────────
  console.log('\n--- GET /categories ---');
  const rCat = await request(app).get('/api/v1/categories');
  verifier('statut 200', rCat.status === 200, `reçu ${rCat.status}`);
  verifier('data.categories est un tableau', Array.isArray(rCat.body?.data?.categories));

  console.log(
    `\n${echecs === 0 ? 'Contrat mobile conforme.' : `${echecs} écart(s) avec le contrat mobile.`}`
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
