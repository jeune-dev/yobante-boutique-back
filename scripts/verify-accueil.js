/**
 * Vérifie la gestion de l'accueil client depuis l'administration :
 * sous-sections (plusieurs blocs par section), promotions par section, et
 * restitution côté client.
 *
 * Usage : node scripts/verify-accueil.js — base de DEV uniquement.
 */
require('dotenv').config();

const request = require('supertest');
const jwt = require('jsonwebtoken');

const sequelize = require('../src/config/db');
const app = require('../src/app');
const { jwtConfig } = require('../src/config/security');
const { User, Categorie, Produit, BlocPromo, Promotion } = require('../src/models');
const { ROLES, SECTION_PROMOTION } = require('../src/constants');

const SUFFIXE = `accueil-${Date.now()}`;
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
  await sequelize.sync();

  const admin = await User.create({
    nom: 'Admin',
    prenom: 'Test',
    email: `admin-${SUFFIXE}@t.co`,
    password: 'x'.repeat(60),
    role: ROLES.ADMIN,
  });
  const token = jwt.sign(
    { id: admin.id, role: ROLES.ADMIN, isActive: true },
    jwtConfig.secret,
    { expiresIn: '1h' }
  );
  const en = (m, url) => request(app)[m](url).set('Authorization', `Bearer ${token}`);

  const categorie = await Categorie.create({ nom: `Cat ${SUFFIXE}`, slug: `cat-${SUFFIXE}` });
  const produit = await Produit.create({
    nom: `Produit ${SUFFIXE}`,
    slug: `produit-${SUFFIXE}`,
    prix: 10000,
    stock: 5,
    categorieId: categorie.id,
    isActive: true,
  });

  // ── Sous-sections : plusieurs blocs dans une même section ────────────────
  console.log('\n--- Sous-sections ---');
  const section = SECTION_PROMOTION.NOS_PROMOS_DU_MOMENT;

  // La base peut déjà contenir des blocs (seeder) : on raisonne en écarts.
  const avant = await BlocPromo.count({ where: { section } });

  const bloc1 = await en('post', '/api/v1/admin/blocs-promo').send({
    section,
    titre: 'Sous-section A',
    sousTitre: 'Première',
  });
  verifier('création acceptée', bloc1.status, 201);
  verifier('placé en fin de section', bloc1.body.data.bloc.ordre, avant);

  const bloc2 = await en('post', '/api/v1/admin/blocs-promo').send({
    section,
    titre: 'Sous-section B',
  });
  verifier('deuxième sous-section', bloc2.status, 201);
  // La création place le bloc en fin de section, sans bousculer l'existant.
  verifier('ordre incrémenté', bloc2.body.data.bloc.ordre, avant + 1);

  verifier(
    'plusieurs blocs coexistent dans une section',
    (await BlocPromo.count({ where: { section } })) - avant,
    2
  );

  const sectionInvalide = await en('post', '/api/v1/admin/blocs-promo').send({
    section: 'section_inexistante',
    titre: 'X',
  });
  verifier('section invalide refusée', sectionInvalide.status, 400);

  // ── Groupement par section ───────────────────────────────────────────────
  console.log('\n--- Restitution groupée ---');
  const liste = await en('get', '/api/v1/admin/blocs-promo');
  verifier('statut 200', liste.status, 200);
  const parSection = liste.body.data.parSection;
  verifier('les trois sections sont présentes', Object.keys(parSection).length, 3);
  verifier('section peuplée', parSection[section].length >= 2, true);
  verifier(
    'sections vides présentes malgré tout',
    Array.isArray(parSection[SECTION_PROMOTION.A_NE_PAS_RATER]),
    true
  );

  // ── Modification et ordre ────────────────────────────────────────────────
  console.log('\n--- Modification ---');
  const id1 = bloc1.body.data.bloc.id;
  const maj = await en('put', `/api/v1/admin/blocs-promo/${id1}`).send({
    titre: 'Titre modifié',
    sousTitre: 'Sous-titre modifié',
  });
  verifier('modification acceptée', maj.status, 200);
  verifier('titre appliqué', maj.body.data.bloc.titre, 'Titre modifié');

  const reordre = await en('post', '/api/v1/admin/blocs-promo/reordonner').send({
    elements: [
      { id: id1, ordre: 5 },
      { id: bloc2.body.data.bloc.id, ordre: 2 },
    ],
  });
  verifier('réordonnancement accepté', reordre.status, 200);
  verifier('ordre persisté', (await BlocPromo.findByPk(id1)).ordre, 5);

  console.log('\n--- Masquage et suppression ---');
  const toggle = await en('patch', `/api/v1/admin/blocs-promo/${id1}/toggle`);
  verifier('bascule acceptée', toggle.status, 200);
  verifier('bloc masqué', (await BlocPromo.findByPk(id1)).isActive, false);

  const suppression = await en('delete', `/api/v1/admin/blocs-promo/${id1}`);
  verifier('suppression acceptée', suppression.status, 200);
  verifier('bloc supprimé', await BlocPromo.findByPk(id1), null);

  const introuvable = await en('put', `/api/v1/admin/blocs-promo/${id1}`).send({ titre: 'X' });
  verifier('modification d un bloc absent refusée', introuvable.status, 404);

  // ── Promotions par section ───────────────────────────────────────────────
  console.log('\n--- Promotions ---');
  const promo = await en('post', '/api/v1/admin/promotions').send({
    produitId: produit.id,
    section,
    prixPromo: 7500,
    pourcentageReduction: 25,
    dateDebut: new Date().toISOString(),
    dateFin: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
  });
  verifier('promotion créée', promo.status === 200 || promo.status === 201, true);

  const parSectionPromos = await en('get', '/api/v1/admin/promotions/sections');
  verifier('route sections accessible', parSectionPromos.status, 200);

  verifier(
    'promotion rattachée à la section',
    await Promotion.count({ where: { section, produitId: produit.id } }),
    1
  );

  // ── Vue client ───────────────────────────────────────────────────────────
  console.log('\n--- Vue client ---');
  const blocsClient = await request(app).get('/api/v1/promotions/blocs');
  verifier('blocs exposés au client', blocsClient.status, 200);

  verifier(
    'les blocs sont bien une liste',
    Array.isArray(blocsClient.body?.data?.blocs),
    true
  );

  const sectionsClient = await request(app).get('/api/v1/promotions');
  verifier('sections exposées au client', sectionsClient.status, 200);

  console.log(
    `\n${echecs === 0 ? 'Gestion de l accueil conforme.' : `${echecs} vérification(s) en échec.`}`
  );
  await sequelize.close();
  process.exit(echecs ? 1 : 0);
}

main().catch(async (err) => {
  console.error('Erreur :', err.message, '\n', err.stack);
  await sequelize.close();
  process.exit(1);
});
