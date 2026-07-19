/**
 * Vérifie qu'une modification faite depuis le dashboard se retrouve bien dans
 * ce que consomme l'application mobile.
 *
 * C'est la question qui compte pour l'administration : « si je change ça ici,
 * est-ce que le client le voit ? » On modifie via les routes admin, puis on
 * relit via les routes publiques du mobile.
 *
 * Usage : node scripts/verify-propagation-accueil.js — base de DEV uniquement.
 */
require('dotenv').config();

const request = require('supertest');
const jwt = require('jsonwebtoken');

const sequelize = require('../src/config/db');
const app = require('../src/app');
const { jwtConfig } = require('../src/config/security');
const { User, BlocPromo } = require('../src/models');
const { ROLES, SECTION_PROMOTION } = require('../src/constants');
const { nettoyerDonneesDeTest } = require('./_nettoyage');

const SUFFIXE = `propag-${Date.now()}`;
let echecs = 0;

function verifier(libelle, condition, detail = '') {
  if (!condition) echecs++;
  console.log(`${condition ? 'OK  ' : 'FAIL'} ${libelle}${detail ? ` — ${detail}` : ''}`);
}

/** Ce que le mobile récupère réellement : GET /promotions/blocs, sans auth. */
const blocsVusParLeMobile = async () => {
  const res = await request(app).get('/api/v1/promotions/blocs');
  return res.body?.data?.blocs ?? [];
};

async function main() {
  await sequelize.authenticate();
  await sequelize.sync();

  const admin = await User.create({
    nom: 'Propag',
    prenom: 'Admin',
    email: `admin-${SUFFIXE}@t.co`,
    password: 'x'.repeat(60),
    role: ROLES.ADMIN,
  });
  const token = jwt.sign({ id: admin.id, role: ROLES.ADMIN, isActive: true }, jwtConfig.secret, {
    expiresIn: '1h',
  });
  const en = (m, url) => request(app)[m](url).set('Authorization', `Bearer ${token}`);

  const section = SECTION_PROMOTION.A_NE_PAS_RATER;

  // ── Ajout d'une sous-section ────────────────────────────────────────────
  console.log("\n--- L'admin ajoute une sous-section ---");
  const avant = (await blocsVusParLeMobile()).length;

  const creation = await en('post', '/api/v1/admin/blocs-promo').send({
    section,
    titre: `Sous-section ${SUFFIXE}`,
    sousTitre: 'Créée depuis le dashboard',
  });
  verifier('création acceptée', creation.status === 201, `reçu ${creation.status}`);
  const id = creation.body?.data?.bloc?.id;

  const apresAjout = await blocsVusParLeMobile();
  verifier('le mobile voit une sous-section de plus', apresAjout.length === avant + 1);
  const vueMobile = apresAjout.find((b) => b.id === id);
  verifier('la nouvelle sous-section est servie au mobile', Boolean(vueMobile));
  verifier(
    'son titre est celui saisi',
    vueMobile?.titre === `Sous-section ${SUFFIXE}`,
    vueMobile?.titre
  );
  verifier('elle est rattachée à la bonne section', vueMobile?.section === section);

  // ── Modification du titre ───────────────────────────────────────────────
  console.log('\n--- Il en modifie le titre ---');
  await en('put', `/api/v1/admin/blocs-promo/${id}`).send({ titre: 'Titre corrigé' });
  const apresModif = await blocsVusParLeMobile();
  verifier(
    'le nouveau titre remonte au mobile',
    apresModif.find((b) => b.id === id)?.titre === 'Titre corrigé'
  );

  // ── Changement d'image ──────────────────────────────────────────────────
  console.log("\n--- Il change l'image ---");
  // L'upload passe par Cloudinary ; on écrit directement l'URL pour vérifier
  // le seul point qui nous intéresse ici : sa restitution au mobile.
  await BlocPromo.update(
    { image: 'https://exemple.test/nouvelle-image.png' },
    { where: { id } }
  );
  const apresImage = await blocsVusParLeMobile();
  verifier(
    "la nouvelle image est celle servie au mobile",
    apresImage.find((b) => b.id === id)?.image === 'https://exemple.test/nouvelle-image.png'
  );

  // ── Masquage ────────────────────────────────────────────────────────────
  console.log('\n--- Il masque la sous-section ---');
  await en('patch', `/api/v1/admin/blocs-promo/${id}/toggle`);
  const apresMasquage = await blocsVusParLeMobile();
  verifier(
    'une sous-section masquée disparaît du mobile',
    !apresMasquage.some((b) => b.id === id)
  );

  // ── Réaffichage puis suppression ────────────────────────────────────────
  console.log('\n--- Il la réaffiche, puis la supprime ---');
  await en('patch', `/api/v1/admin/blocs-promo/${id}/toggle`);
  verifier(
    'réaffichée, elle revient sur le mobile',
    (await blocsVusParLeMobile()).some((b) => b.id === id)
  );

  await en('delete', `/api/v1/admin/blocs-promo/${id}`);
  verifier(
    'supprimée, elle disparaît du mobile',
    !(await blocsVusParLeMobile()).some((b) => b.id === id)
  );

  // ── Ordre d'affichage ───────────────────────────────────────────────────
  console.log("\n--- L'ordre défini par l'admin est respecté ---");
  const duMoment = (await blocsVusParLeMobile()).filter(
    (b) => b.section === SECTION_PROMOTION.NOS_PROMOS_DU_MOMENT
  );
  const ordres = duMoment.map((b) => b.ordre);
  const trie = [...ordres].sort((a, b) => a - b);
  verifier(
    'les sous-sections arrivent triées par ordre',
    JSON.stringify(ordres) === JSON.stringify(trie),
    JSON.stringify(ordres)
  );

  console.log(
    `\n${echecs === 0 ? 'Les modifications du dashboard remontent bien au mobile.' : `${echecs} vérification(s) en échec.`}`
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
