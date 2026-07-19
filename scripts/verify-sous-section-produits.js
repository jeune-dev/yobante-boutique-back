/**
 * Vérifie la personnalisation d'une sous-section : rattachement de produits,
 * remise, durée, ordre, et disparition automatique à l'expiration.
 *
 * Usage : node scripts/verify-sous-section-produits.js — base de DEV uniquement.
 */
require('dotenv').config();

const request = require('supertest');
const jwt = require('jsonwebtoken');

const sequelize = require('../src/config/db');
const app = require('../src/app');
const { jwtConfig } = require('../src/config/security');
const { User, Categorie, Produit } = require('../src/models');
const { ROLES, SECTION_PROMOTION } = require('../src/constants');
const { nettoyerDonneesDeTest } = require('./_nettoyage');

const SUFFIXE = `soussect-${Date.now()}`;
let echecs = 0;

function verifier(libelle, condition, detail = '') {
  if (!condition) echecs++;
  console.log(`${condition ? 'OK  ' : 'FAIL'} ${libelle}${detail ? ` — ${detail}` : ''}`);
}

/** Ce que le client reçoit pour une sous-section donnée. */
const vueClient = async (blocId) => {
  const res = await request(app).get(`/api/v1/promotions/blocs/${blocId}/produits`);
  return { status: res.status, promotions: res.body?.data?.promotions ?? [] };
};

async function main() {
  await sequelize.authenticate();
  await sequelize.sync();

  const admin = await User.create({
    nom: 'SousSect',
    prenom: 'Admin',
    email: `admin-${SUFFIXE}@t.co`,
    password: 'x'.repeat(60),
    role: ROLES.ADMIN,
  });
  const token = jwt.sign({ id: admin.id, role: ROLES.ADMIN, isActive: true }, jwtConfig.secret, {
    expiresIn: '1h',
  });
  const en = (m, url) => request(app)[m](url).set('Authorization', `Bearer ${token}`);

  const categorie = await Categorie.create({ nom: `Cat ${SUFFIXE}`, slug: `cat-${SUFFIXE}` });
  const produits = [];
  for (const n of [1, 2, 3]) {
    produits.push(
      await Produit.create({
        nom: `Produit ${n} ${SUFFIXE}`,
        slug: `produit-${n}-${SUFFIXE}`,
        prix: 10000,
        stock: 10,
        categorieId: categorie.id,
        isActive: true,
      })
    );
  }

  // ── La sous-section à personnaliser ─────────────────────────────────────
  const bloc = await en('post', '/api/v1/admin/blocs-promo').send({
    section: SECTION_PROMOTION.NOS_PROMOS_DU_MOMENT,
    titre: `Sous-section ${SUFFIXE}`,
  });
  const blocId = bloc.body?.data?.bloc?.id;
  verifier('sous-section créée', bloc.status === 201, `reçu ${bloc.status}`);

  const demain = new Date(Date.now() + 24 * 3600 * 1000);
  const hier = new Date(Date.now() - 24 * 3600 * 1000);
  const avantHier = new Date(Date.now() - 48 * 3600 * 1000);

  console.log("\n--- L'admin rattache des produits ---");
  const creer = (produit, corps) =>
    en('post', '/api/v1/admin/promotions').send({
      produitId: produit.id,
      blocPromoId: blocId,
      section: SECTION_PROMOTION.NOS_PROMOS_DU_MOMENT,
      ...corps,
    });

  const p1 = await creer(produits[0], {
    prixPromo: 7000,
    pourcentageReduction: 30,
    dateDebut: hier.toISOString(),
    dateFin: demain.toISOString(),
    ordre: 0,
  });
  verifier('produit rattaché', p1.status === 201, `reçu ${p1.status}`);
  verifier('rattachement à la sous-section', p1.body?.data?.promotion?.blocPromoId === blocId);

  const p2 = await creer(produits[1], {
    prixPromo: 8000,
    pourcentageReduction: 20,
    dateDebut: hier.toISOString(),
    dateFin: demain.toISOString(),
    ordre: 1,
  });

  // Promotion déjà terminée : elle ne doit jamais apparaître côté client.
  const p3 = await creer(produits[2], {
    prixPromo: 5000,
    pourcentageReduction: 50,
    dateDebut: avantHier.toISOString(),
    dateFin: hier.toISOString(),
    ordre: 2,
  });
  verifier('promotion expirée acceptée en base', p3.status === 201);

  console.log('\n--- Ce que le client voit ---');
  const vue = await vueClient(blocId);
  verifier('route accessible sans authentification', vue.status === 200, `reçu ${vue.status}`);
  verifier('deux produits visibles sur trois', vue.promotions.length === 2, `${vue.promotions.length}`);
  verifier(
    'la promotion expirée a disparu',
    !vue.promotions.some((p) => p.produitId === produits[2].id)
  );
  // DECIMAL renvoyé en chaîne par Sequelize : on compare la valeur, pas le type.
  verifier(
    'la remise est exposée',
    Number(vue.promotions[0]?.pourcentageReduction) === 30,
    JSON.stringify(vue.promotions[0]?.pourcentageReduction)
  );
  verifier('le produit est joint', Boolean(vue.promotions[0]?.produit?.nom));

  console.log("\n--- L'admin réorganise l'ordre ---");
  const idP1 = p1.body.data.promotion.id;
  const idP2 = p2.body.data.promotion.id;
  const reordre = await en('post', '/api/v1/admin/promotions/reordonner').send({
    elements: [
      { id: idP1, ordre: 5 },
      { id: idP2, ordre: 1 },
    ],
  });
  verifier('réordonnancement accepté', reordre.status === 200, `reçu ${reordre.status}`);

  const apres = await vueClient(blocId);
  verifier(
    'le client voit le nouvel ordre',
    apres.promotions[0]?.id === idP2 && apres.promotions[1]?.id === idP1,
    apres.promotions.map((p) => p.ordre).join(', ')
  );

  console.log("\n--- L'admin change la durée ---");
  // On ramène la fin dans le passé : le produit doit sortir de la page.
  await en('put', `/api/v1/admin/promotions/${idP2}`).send({ dateFin: hier.toISOString() });
  const apresExpiration = await vueClient(blocId);
  verifier(
    'un produit dont la durée est écoulée disparaît',
    !apresExpiration.promotions.some((p) => p.id === idP2),
    `${apresExpiration.promotions.length} restant(s)`
  );

  console.log('\n--- Filtrage par sous-section côté administration ---');
  const listeAdmin = await en('get', `/api/v1/admin/promotions?blocPromoId=${blocId}`);
  verifier('liste filtrée accessible', listeAdmin.status === 200);
  verifier(
    'les trois promotions restent visibles pour l admin',
    (listeAdmin.body?.data?.promotions ?? []).length === 3,
    `${(listeAdmin.body?.data?.promotions ?? []).length}`
  );

  console.log('\n--- Sous-section masquée ---');
  await en('patch', `/api/v1/admin/blocs-promo/${blocId}/toggle`);
  const masquee = await vueClient(blocId);
  verifier('une sous-section masquée n est plus servie', masquee.status === 404, `reçu ${masquee.status}`);

  console.log(
    `\n${echecs === 0 ? 'Personnalisation des sous-sections conforme.' : `${echecs} vérification(s) en échec.`}`
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
