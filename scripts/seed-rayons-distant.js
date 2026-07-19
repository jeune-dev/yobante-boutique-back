/**
 * Crée les rayons et sous-rayons sur une instance distante, via l'API admin.
 *
 * Le seeder classique (src/seeders/seed-rayons.js) écrit dans la base pointée
 * par le .env local. Ici rien n'est écrit en direct : tout passe par les routes
 * /admin/rayons, ce qui évite d'avoir à exposer la base de production.
 *
 * Idempotent : l'API refuse un doublon de slug, ce cas est compté à part et
 * n'interrompt pas le reste.
 *
 * Usage :
 *   node scripts/seed-rayons-distant.js --url <base> --email <a> --motdepasse <b>
 *
 * `--url` doit inclure le préfixe d'API, par exemple :
 *   https://yobante-boutique-back-14ff.onrender.com/api/v1
 */
'use strict';

const { RAYONS } = require('../src/seeders/rayons.data');

function lireArguments() {
  const args = process.argv.slice(2);
  const valeur = (nom) => {
    const i = args.indexOf(`--${nom}`);
    return i !== -1 ? args[i + 1] : undefined;
  };
  return {
    url: valeur('url') || process.env.API_URL,
    email: valeur('email') || process.env.ADMIN_EMAIL,
    motdepasse: valeur('motdepasse') || process.env.ADMIN_PASSWORD,
  };
}

/** Remonte le message de l'API plutôt qu'un « 400 » nu. */
async function appeler(url, options) {
  const res = await fetch(url, options);
  let corps = null;
  try {
    corps = await res.json();
  } catch {
    /* réponse sans JSON : on s'en tient au statut */
  }
  return { statut: res.status, ok: res.ok, corps };
}

/** Le message seul dit « Données invalides » sans jamais nommer le champ fautif. */
function detailErreur(corps) {
  const details = corps?.details;
  const suffixe = Array.isArray(details) && details.length ? ` — ${details.join(', ')}` : '';
  return `${corps?.message ?? ''}${suffixe}`;
}

async function main() {
  const { url, email, motdepasse } = lireArguments();

  if (!url || !email || !motdepasse) {
    console.error(
      'Paramètres manquants.\n' +
        'Usage : node scripts/seed-rayons-distant.js --url <base> --email <a> --motdepasse <b>'
    );
    process.exit(1);
  }

  const base = url.replace(/\/+$/, '');
  console.log(`Cible : ${base}`);

  // ── Authentification ────────────────────────────────────────────────
  const login = await appeler(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Le login attend `identifiant` (email ou téléphone) et `password`, et
    // rejette toute clé supplémentaire.
    body: JSON.stringify({ identifiant: email, password: motdepasse }),
  });

  if (!login.ok) {
    console.error(`Connexion refusée (${login.statut}) : ${detailErreur(login.corps)}`);
    process.exit(1);
  }

  // Le jeton est tantôt à la racine, tantôt sous data selon les routes.
  const d = login.corps?.data ?? login.corps ?? {};
  const token = d.token || d.accessToken || d.access_token;
  if (!token) {
    console.error('Connexion acceptée mais aucun jeton trouvé dans la réponse.');
    process.exit(1);
  }
  console.log('Authentification OK');

  const entetes = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // ── État de départ ──────────────────────────────────────────────────
  const avant = await appeler(`${base}/admin/rayons?limit=200`, { headers: entetes });
  if (!avant.ok) {
    console.error(`Lecture des rayons impossible (${avant.statut}) : ${detailErreur(avant.corps)}`);
    process.exit(1);
  }
  const dejaLa = avant.corps?.data?.rayons ?? avant.corps?.rayons ?? [];
  console.log(`Rayons déjà présents : ${dejaLa.length}`);

  const parNom = new Map(dejaLa.map((r) => [r.nom, r]));

  let rayonsCrees = 0;
  let sousRayonsCrees = 0;
  let ignores = 0;
  const echecs = [];

  // ── Création ────────────────────────────────────────────────────────
  for (const definition of RAYONS) {
    let rayon = parNom.get(definition.nom);

    if (!rayon) {
      const res = await appeler(`${base}/admin/rayons`, {
        method: 'POST',
        headers: entetes,
        body: JSON.stringify({ nom: definition.nom }),
      });
      if (res.ok) {
        rayon = res.corps?.data?.rayon ?? res.corps?.rayon;
        rayonsCrees++;
        console.log(`  rayon créé : ${definition.nom}`);
      } else {
        echecs.push(`${definition.nom} — ${res.statut} ${detailErreur(res.corps)}`);
        continue;
      }
    } else {
      ignores++;
      console.log(`  déjà présent : ${definition.nom}`);
    }

    if (!rayon?.id) {
      echecs.push(`${definition.nom} — identifiant absent de la réponse`);
      continue;
    }

    const existants = new Set((rayon.sousRayons ?? []).map((s) => s.nom));

    for (const nomSousRayon of definition.sousRayons) {
      if (existants.has(nomSousRayon)) continue;
      const res = await appeler(`${base}/admin/rayons/${rayon.id}/sous-rayons`, {
        method: 'POST',
        headers: entetes,
        body: JSON.stringify({ nom: nomSousRayon }),
      });
      if (res.ok) {
        sousRayonsCrees++;
      } else {
        echecs.push(`${definition.nom} › ${nomSousRayon} — ${res.statut} ${detailErreur(res.corps)}`);
      }
    }
  }

  // ── Vérification ────────────────────────────────────────────────────
  const apres = await appeler(`${base}/admin/rayons?limit=200`, { headers: entetes });
  const finaux = apres.corps?.data?.rayons ?? apres.corps?.rayons ?? [];
  const totalSous = finaux.reduce((n, r) => n + (r.sousRayons?.length ?? 0), 0);

  console.log(
    `\nTerminé — ${rayonsCrees} rayon(s) et ${sousRayonsCrees} sous-rayon(s) créés,` +
      ` ${ignores} déjà présent(s).`
  );
  console.log(`En base distante : ${finaux.length} rayons, ${totalSous} sous-rayons.`);

  if (echecs.length) {
    console.log(`\n${echecs.length} échec(s) :`);
    for (const e of echecs) console.log(`  - ${e}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('Échec :', e.message);
  process.exit(1);
});
