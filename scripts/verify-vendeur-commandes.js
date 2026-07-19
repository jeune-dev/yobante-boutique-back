/**
 * Vérification des agrégats de ventes vendeur sur une vraie base Postgres.
 *
 * Sème un jeu de données couvrant les cas limites (commande multi-vendeurs,
 * commande annulée, vendeur sans vente) puis compare les résultats du service
 * aux valeurs attendues calculées à la main.
 *
 * Usage : node scripts/verify-vendeur-commandes.js
 * À lancer sur une base de DEV uniquement — le script écrit des données.
 */
require('dotenv').config();

const sequelize = require('../src/config/db');
const {
  User,
  Categorie,
  Produit,
  Adresse,
  Commande,
  CommandeItem,
} = require('../src/models');
const VendeurCommandeService = require('../src/services/vendeur/commande.service');
const { STATUT_COMMANDE, STATUT_VALIDATION_PRODUIT, ROLES } = require('../src/constants');
const { nettoyerDonneesDeTest } = require('./_nettoyage');

const SUFFIXE = `verif-${Date.now()}`;
let echecs = 0;

function verifier(libelle, recu, attendu) {
  const ok = JSON.stringify(recu) === JSON.stringify(attendu);
  if (!ok) echecs++;
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} ${libelle.padEnd(46)} attendu ${JSON.stringify(attendu)} → reçu ${JSON.stringify(recu)}`
  );
}

async function main() {
  await sequelize.authenticate();
  await sequelize.sync();

  // ── Jeu de données ────────────────────────────────────────────────────────
  const motDePasse = 'x'.repeat(60); // hash bidon, aucune authentification ici

  const [vendeurA, vendeurB, vendeurSansVente, client] = await Promise.all([
    User.create({ nom: 'A', prenom: 'Vendeur', email: `a-${SUFFIXE}@t.co`, password: motDePasse, role: ROLES.VENDEUR }),
    User.create({ nom: 'B', prenom: 'Vendeur', email: `b-${SUFFIXE}@t.co`, password: motDePasse, role: ROLES.VENDEUR }),
    User.create({ nom: 'C', prenom: 'Vendeur', email: `c-${SUFFIXE}@t.co`, password: motDePasse, role: ROLES.VENDEUR }),
    User.create({ nom: 'D', prenom: 'Client', email: `d-${SUFFIXE}@t.co`, password: motDePasse, role: ROLES.CLIENT }),
  ]);

  const categorie = await Categorie.create({ nom: `Cat ${SUFFIXE}`, slug: `cat-${SUFFIXE}` });

  const nouveauProduit = (nom, vendeurId, prix) =>
    Produit.create({
      nom,
      slug: `${nom}-${SUFFIXE}`.toLowerCase(),
      prix,
      stock: 100,
      categorieId: categorie.id,
      vendeurId,
      statutValidation: STATUT_VALIDATION_PRODUIT.VALIDE,
      isActive: true,
    });

  const [a1, a2, b1] = await Promise.all([
    nouveauProduit('A1', vendeurA.id, 1000),
    nouveauProduit('A2', vendeurA.id, 300),
    nouveauProduit('B1', vendeurB.id, 500),
  ]);

  const adresse = await Adresse.create({
    userId: client.id,
    nomComplet: 'Client Test',
    telephone: '770000000',
    rue: 'Rue 1',
    ville: 'Dakar',
    pays: 'SN',
  });

  const nouvelleCommande = (reference, statut, montantTotal) =>
    Commande.create({
      reference: `${reference}-${SUFFIXE}`,
      userId: client.id,
      adresseId: adresse.id,
      statut,
      montantTotal,
    });

  // C1 : multi-vendeurs, livrée → A compte 2000 sur 2500
  const c1 = await nouvelleCommande('C1', STATUT_COMMANDE.LIVREE, 2500);
  await CommandeItem.create({ commandeId: c1.id, produitId: a1.id, quantite: 2, prixUnitaire: 1000, sousTotal: 2000 });
  await CommandeItem.create({ commandeId: c1.id, produitId: b1.id, quantite: 1, prixUnitaire: 500, sousTotal: 500 });

  // C2 : annulée → exclue du CA
  const c2 = await nouvelleCommande('C2', STATUT_COMMANDE.ANNULEE, 900);
  await CommandeItem.create({ commandeId: c2.id, produitId: a2.id, quantite: 3, prixUnitaire: 300, sousTotal: 900 });

  // C3 : en attente → comptée dans le CA et dans les commandes à traiter
  const c3 = await nouvelleCommande('C3', STATUT_COMMANDE.EN_ATTENTE, 1000);
  await CommandeItem.create({ commandeId: c3.id, produitId: a1.id, quantite: 1, prixUnitaire: 1000, sousTotal: 1000 });

  // C4 : vendeur B seul → ne doit jamais remonter chez A
  const c4 = await nouvelleCommande('C4', STATUT_COMMANDE.LIVREE, 500);
  await CommandeItem.create({ commandeId: c4.id, produitId: b1.id, quantite: 1, prixUnitaire: 500, sousTotal: 500 });

  // ── Ventes du vendeur A ───────────────────────────────────────────────────
  const { ventes } = await VendeurCommandeService.getVentes(vendeurA.id);
  console.log('\n--- getVentes(vendeurA) ---');
  verifier("CA hors commande annulée", ventes.chiffreAffaires, 3000);
  verifier('Unités vendues', ventes.unitesVendues, 3);
  verifier('Nombre de commandes', ventes.nombreCommandes, 2);
  verifier('Commandes à traiter', ventes.commandesATraiter, 1);
  verifier('Top produits : 1 seule ligne (A1)', ventes.topProduits.length, 1);
  verifier('Top produit nom', ventes.topProduits[0]?.nom, 'A1');
  verifier('Top produit unités', ventes.topProduits[0]?.unites, 3);
  verifier('Top produit CA', ventes.topProduits[0]?.chiffreAffaires, 3000);
  verifier('Série par jour : 1 point', ventes.parJour.length, 1);
  verifier('CA du jour', ventes.parJour[0]?.chiffreAffaires, 3000);

  // ── Vendeur sans aucune vente ─────────────────────────────────────────────
  const vide = await VendeurCommandeService.getVentes(vendeurSansVente.id);
  console.log('\n--- getVentes(vendeur sans vente) ---');
  verifier('CA à zéro', vide.ventes.chiffreAffaires, 0);
  verifier('Unités à zéro', vide.ventes.unitesVendues, 0);
  verifier('Commandes à zéro', vide.ventes.nombreCommandes, 0);
  verifier('Top produits vide', vide.ventes.topProduits, []);

  // ── Liste des commandes du vendeur A ──────────────────────────────────────
  const liste = await VendeurCommandeService.getMesCommandes(vendeurA.id);
  console.log('\n--- getMesCommandes(vendeurA) ---');
  verifier('3 commandes (C4 exclue)', liste.pagination.total, 3);
  const c1Vue = liste.commandes.find((c) => c.reference === `C1-${SUFFIXE}`);
  verifier('C1 : une seule ligne (produit de B masqué)', c1Vue?.items.length, 1);
  verifier('C1 : montant vendeur = 2000, pas 2500', c1Vue?.montantVendeur, 2000);
  verifier('C1 : montantTotal non exposé', c1Vue?.montantTotal, undefined);

  const listeVide = await VendeurCommandeService.getMesCommandes(vendeurSansVente.id);
  verifier('Vendeur sans vente : liste vide', listeVide.commandes, []);

  // ── Cloisonnement du détail ───────────────────────────────────────────────
  console.log('\n--- getCommandeById ---');
  const detailOk = await VendeurCommandeService.getCommandeById(vendeurA.id, c1.id);
  verifier('A accède à C1', detailOk.success, true);
  verifier('A ne voit que sa ligne dans C1', detailOk.commande?.items.length, 1);
  const detailKo = await VendeurCommandeService.getCommandeById(vendeurA.id, c4.id);
  verifier('A ne peut pas ouvrir C4 (vendeur B)', detailKo.success, false);

  console.log(`\n${echecs === 0 ? 'Toutes les vérifications passent.' : `${echecs} vérification(s) en échec.`}`);
  await nettoyerDonneesDeTest(SUFFIXE);
  await sequelize.close();
  process.exit(echecs ? 1 : 0);
}

main().catch(async (err) => {
  console.error('Erreur :', err.message);
  console.error(err.stack);
  await nettoyerDonneesDeTest(SUFFIXE);
  await sequelize.close();
  process.exit(1);
});
