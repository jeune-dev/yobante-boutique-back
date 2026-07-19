/**
 * Vérifie que les listes de l'administration renvoient exactement les clés que
 * le dashboard lit.
 *
 * Le dashboard déballe l'enveloppe { success, message, data } : ce script
 * contrôle donc le contenu de `data`, clé par clé, pour chaque écran.
 *
 * Usage : node scripts/verify-contrat-dashboard.js — base de DEV uniquement.
 */
require('dotenv').config();

const request = require('supertest');
const jwt = require('jsonwebtoken');

const sequelize = require('../src/config/db');
const app = require('../src/app');
const { jwtConfig } = require('../src/config/security');
const { User } = require('../src/models');
const { ROLES } = require('../src/constants');
const { nettoyerDonneesDeTest } = require('./_nettoyage');

const SUFFIXE = `dash-${Date.now()}`;
let echecs = 0;

function verifier(libelle, condition, detail = '') {
  if (!condition) echecs++;
  console.log(`${condition ? 'OK  ' : 'FAIL'} ${libelle}${detail ? ` — ${detail}` : ''}`);
}

async function main() {
  await sequelize.authenticate();
  await sequelize.sync();

  const admin = await User.create({
    nom: 'Dash',
    prenom: 'Admin',
    email: `dash-${SUFFIXE}@t.co`,
    password: 'x'.repeat(60),
    role: ROLES.ADMIN,
  });
  const token = jwt.sign({ id: admin.id, role: ROLES.ADMIN, isActive: true }, jwtConfig.secret, {
    expiresIn: '1h',
  });
  const appel = (url) => request(app).get(url).set('Authorization', `Bearer ${token}`);

  // Chaque entrée : l'écran, la route, et les clés que le dashboard lit.
  const ecrans = [
    { ecran: 'Clients', url: '/api/v1/admin/users', tableau: 'users', pagine: true },
    { ecran: 'Produits', url: '/api/v1/admin/produits', tableau: 'produits', pagine: true },
    { ecran: 'Commandes', url: '/api/v1/admin/commandes', tableau: 'commandes', pagine: true },
    { ecran: 'Avis', url: '/api/v1/admin/avis', tableau: 'avis', pagine: true },
    { ecran: 'Paiements', url: '/api/v1/admin/paiements', tableau: 'paiements', pagine: true },
    { ecran: 'Vendeurs', url: '/api/v1/admin/vendeurs', tableau: 'vendeurs' },
    { ecran: 'Bannières', url: '/api/v1/admin/bannieres', tableau: 'bannieres' },
    { ecran: 'Catégories', url: '/api/v1/admin/categories', tableau: 'categories' },
    { ecran: 'Rayons', url: '/api/v1/admin/rayons', tableau: 'rayons' },
    { ecran: 'Promotions', url: '/api/v1/admin/promotions', tableau: 'promotions' },
    { ecran: 'Blocs promo', url: '/api/v1/admin/blocs-promo', tableau: 'blocs' },
    { ecran: 'Demandes', url: '/api/v1/admin/produits/validation/liste', tableau: 'produits' },
  ];

  console.log('\n--- Listes ---');
  for (const { ecran, url, tableau, pagine } of ecrans) {
    const res = await appel(url);
    const data = res.body?.data;

    verifier(`${ecran.padEnd(12)} statut 200`, res.status === 200, `reçu ${res.status}`);
    if (res.status !== 200) continue;

    verifier(
      `${ecran.padEnd(12)} data.${tableau} est un tableau`,
      Array.isArray(data?.[tableau]),
      `reçu ${JSON.stringify(Object.keys(data ?? {}))}`
    );

    if (pagine) {
      verifier(
        `${ecran.padEnd(12)} pagination.total et totalPages`,
        data?.pagination?.total !== undefined && data?.pagination?.totalPages !== undefined,
        `reçu ${JSON.stringify(data?.pagination)}`
      );
    }
  }

  // Le tableau de bord agrège plusieurs indicateurs sur une seule route.
  console.log('\n--- Tableau de bord ---');
  const kpi = await appel('/api/v1/admin/dashboard/kpi-complet');
  verifier('kpi-complet statut 200', kpi.status === 200, `reçu ${kpi.status}`);
  if (kpi.status === 200) {
    for (const cle of ['kpi', 'revenusParMois', 'produitsPlusVendus', 'commandesParStatut']) {
      verifier(`kpi-complet contient « ${cle} »`, kpi.body?.data?.[cle] !== undefined);
    }
  }

  console.log('\n--- Profil ---');
  const profil = await appel('/api/v1/profile');
  verifier('profil statut 200', profil.status === 200, `reçu ${profil.status}`);
  verifier('profil expose user', profil.body?.data?.user !== undefined);

  console.log(
    `\n${echecs === 0 ? 'Contrat dashboard conforme.' : `${echecs} écart(s) avec le dashboard.`}`
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
