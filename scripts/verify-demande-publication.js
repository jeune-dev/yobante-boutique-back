/**
 * Vérifie le cycle d'une demande de publication vendeur :
 * soumission avec message, rejet motivé, restitution du motif, resoumission.
 *
 * Contrôle aussi que le vendeur ne peut pas s'attribuer des champs réservés
 * à l'administration (isFeatured, stock, noteMoyenne…).
 *
 * Usage : node scripts/verify-demande-publication.js — base de DEV uniquement.
 */
require('dotenv').config();

const sequelize = require('../src/config/db');
const { User, Categorie, Produit, ProfilVendeur } = require('../src/models');
const VendeurProduitService = require('../src/services/vendeur/produit.service');
const AdminProduitService = require('../src/services/admin/produit.service');
const { STATUT_VALIDATION_PRODUIT, ROLES } = require('../src/constants');

const SUFFIXE = `demande-${Date.now()}`;
let echecs = 0;

function verifier(libelle, recu, attendu) {
  const ok = JSON.stringify(recu) === JSON.stringify(attendu);
  if (!ok) echecs++;
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} ${libelle.padEnd(52)} attendu ${JSON.stringify(attendu)} → reçu ${JSON.stringify(recu)}`
  );
}

async function main() {
  await sequelize.authenticate();
  // Pas d'`alter: true` : sur Postgres, Sequelize régénère pour les colonnes
  // ENUM un `ALTER COLUMN ... TYPE ... USING` invalide. Les colonnes de cette
  // fonctionnalité sont créées par la migration 20260718000002.
  await sequelize.sync();

  const vendeur = await User.create({
    nom: 'Demande',
    prenom: 'Vendeur',
    email: `v-${SUFFIXE}@t.co`,
    password: 'x'.repeat(60),
    role: ROLES.VENDEUR,
  });
  await ProfilVendeur.create({
    userId: vendeur.id,
    nomBoutique: `Boutique ${SUFFIXE}`,
    isActive: true,
  });
  const categorie = await Categorie.create({ nom: `Cat ${SUFFIXE}`, slug: `cat-${SUFFIXE}` });

  // ── Soumission ────────────────────────────────────────────────────────────
  console.log('\n--- Soumission de la demande ---');
  const soumission = await VendeurProduitService.soumettreProduit(vendeur.id, {
    nom: `Produit ${SUFFIXE}`,
    description: 'Une description détaillée du produit.',
    prix: 12000,
    stockAlloue: 50,
    categorieId: categorie.id,
    messageVendeur: 'Bonjour, ce produit est fabriqué localement. Merci de le valider.',
    // Champs réservés à l'administration, injectés volontairement :
    isFeatured: true,
    stock: 9999,
    noteMoyenne: 5,
    statutValidation: STATUT_VALIDATION_PRODUIT.VALIDE,
    isActive: true,
  });

  verifier('soumission acceptée', soumission.success, true);
  const id = soumission.produit.id;
  const cree = await Produit.findByPk(id);

  verifier('statut en attente', cree.statutValidation, STATUT_VALIDATION_PRODUIT.EN_ATTENTE);
  verifier('produit non actif', cree.isActive, false);
  verifier('stock demandé conservé', cree.stockAlloue, 50);
  verifier('message vendeur enregistré', cree.messageVendeur !== null, true);
  verifier('isFeatured non injectable', cree.isFeatured, false);
  verifier('stock non injectable', cree.stock, 0);
  verifier('noteMoyenne non injectable', Number(cree.noteMoyenne), 0);

  // ── Rejet motivé ──────────────────────────────────────────────────────────
  console.log('\n--- Rejet par l administration ---');
  const motif = 'Photos trop sombres, merci de les reprendre.';
  const rejet = await AdminProduitService.rejeterProduit(id, motif);
  verifier('rejet appliqué', rejet.success, true);

  const rejete = await Produit.findByPk(id);
  verifier('statut rejeté', rejete.statutValidation, STATUT_VALIDATION_PRODUIT.REJETE);
  verifier('motif de rejet persisté', rejete.motifRejet, motif);

  // Le vendeur doit lire le motif depuis sa liste de produits.
  const mesProduits = await VendeurProduitService.getMesProduits(vendeur.id, {});
  const vuVendeur = mesProduits.produits.find((p) => p.id === id);
  verifier('motif visible par le vendeur', vuVendeur.motifRejet, motif);

  // ── Resoumission après correction ─────────────────────────────────────────
  console.log('\n--- Resoumission après correction ---');
  const maj = await VendeurProduitService.updateProduit(vendeur.id, id, {
    description: 'Description corrigée.',
    messageVendeur: 'Photos refaites en lumière du jour.',
  });
  verifier('modification acceptée', maj.success, true);

  const resoumis = await Produit.findByPk(id);
  verifier('repasse en attente', resoumis.statutValidation, STATUT_VALIDATION_PRODUIT.EN_ATTENTE);
  verifier('ancien motif efface', resoumis.motifRejet, null);

  console.log(
    `\n${echecs === 0 ? 'Cycle de demande conforme.' : `${echecs} vérification(s) en échec.`}`
  );
  await sequelize.close();
  process.exit(echecs ? 1 : 0);
}

main().catch(async (err) => {
  console.error('Erreur :', err.message, '\n', err.stack);
  await sequelize.close();
  process.exit(1);
});
