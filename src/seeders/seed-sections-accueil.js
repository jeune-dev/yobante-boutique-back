/**
 * Verse en base les sections et sous-sections aujourd'hui figées dans
 * l'application mobile.
 *
 * Les visuels vivaient dans `assets/images/` de l'app Flutter : impossible de
 * les changer sans republier. Ce script les téléverse sur Cloudinary et crée
 * les bannières et blocs correspondants, pour que l'administration en reprenne
 * la main depuis le dashboard.
 *
 * Idempotent : un bloc déjà présent (même section, même titre) est laissé tel
 * quel, on ne réimporte pas son image. Relancer le script est sans effet.
 *
 * Usage : node src/seeders/seed-sections-accueil.js [chemin/vers/assets]
 */
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const sequelize = require('../config/db');
const { BlocPromo, Banniere } = require('../models');
const { uploadImage } = require('../services/upload.service');
const { SECTION_PROMOTION } = require('../constants');
const logger = require('../config/logger');

// Emplacement par défaut des visuels de l'app mobile, en voisin du backend.
const ASSETS_PAR_DEFAUT = path.resolve(__dirname, '../../../yobante-boutique-mobile/assets/images');

/**
 * Contenu repris à l'identique de l'accueil mobile.
 * `fichier` référence un visuel livré avec l'application.
 */
const BANNIERES = [{ titre: 'Bannière principale', fichier: 'banniere du haut.png', ordre: 0 }];

const BLOCS = [
  {
    section: SECTION_PROMOTION.NOS_PROMOS_DU_MOMENT,
    titre: 'Promo du moment 1',
    sousTitre: null,
    fichier: 'promo1.png',
    ordre: 0,
  },
  {
    section: SECTION_PROMOTION.NOS_PROMOS_DU_MOMENT,
    titre: 'Promo du moment 2',
    sousTitre: null,
    fichier: 'promo2.png',
    ordre: 1,
  },
  {
    section: SECTION_PROMOTION.NOS_PROMOS_DU_MOMENT,
    titre: 'Promo du moment 3',
    sousTitre: null,
    fichier: 'promo3.png',
    ordre: 2,
  },
  {
    section: SECTION_PROMOTION.NOS_PROMOS_A_VENIR,
    titre: 'Tabaski',
    sousTitre: 'Bientôt disponible',
    fichier: 'tabaski.png',
    ordre: 0,
  },
  {
    section: SECTION_PROMOTION.NOS_PROMOS_A_VENIR,
    titre: 'Rentrée des classes',
    sousTitre: 'Bientôt disponible',
    fichier: 'rentree des classes.png',
    ordre: 1,
  },
  {
    section: SECTION_PROMOTION.NOS_PROMOS_A_VENIR,
    titre: 'Black Friday',
    sousTitre: 'Bientôt disponible',
    fichier: 'black friday.png',
    ordre: 2,
  },
  // « À ne pas rater » n'avait aucune image : l'app y affichait des cartes
  // dégradées avec du texte. On crée les sous-sections correspondantes, sans
  // visuel — l'administration pourra en déposer un depuis le dashboard.
  {
    section: SECTION_PROMOTION.A_NE_PAS_RATER,
    titre: "Jusqu'à -50 %",
    sousTitre: 'sur une sélection de produits',
    fichier: null,
    ordre: 0,
  },
  {
    section: SECTION_PROMOTION.A_NE_PAS_RATER,
    titre: 'Livraison gratuite',
    sousTitre: 'en point relais à Touba',
    fichier: null,
    ordre: 1,
  },
  {
    section: SECTION_PROMOTION.A_NE_PAS_RATER,
    titre: 'Nouveau : Électro',
    sousTitre: 'Découvrez nos nouveautés',
    fichier: null,
    ordre: 2,
  },
];

let uploadsEchoues = 0;

/**
 * Téléverse un visuel local et renvoie son URL.
 *
 * Renvoie null si le fichier manque ou si Cloudinary refuse : la sous-section
 * est alors créée sans image. Mieux vaut une structure en place, dont
 * l'administration complétera les visuels depuis le dashboard, qu'un import
 * interrompu au premier échec.
 */
async function televerser(dossier, fichier, sousDossier) {
  if (!fichier) return null;

  const chemin = path.join(dossier, fichier);
  if (!fs.existsSync(chemin)) {
    console.log(`   visuel introuvable, ignoré : ${fichier}`);
    return null;
  }

  try {
    const url = await uploadImage(fs.readFileSync(chemin), fichier, sousDossier);
    console.log(`   téléversé : ${fichier}`);
    return url;
  } catch (err) {
    uploadsEchoues++;
    console.log(`   téléversement refusé (${err.message}) : ${fichier}`);
    return null;
  }
}

async function seedSectionsAccueil(dossierAssets = ASSETS_PAR_DEFAUT) {
  if (!fs.existsSync(dossierAssets)) {
    throw new Error(`Dossier de visuels introuvable : ${dossierAssets}`);
  }

  console.log(`Visuels lus depuis : ${dossierAssets}\n`);

  // ── Bannières ───────────────────────────────────────────────────────────
  console.log('Bannières');
  for (const banniere of BANNIERES) {
    const existante = await Banniere.findOne({ where: { titre: banniere.titre } });
    if (existante) {
      console.log(`   déjà présente : ${banniere.titre}`);
      continue;
    }

    const image = await televerser(dossierAssets, banniere.fichier, 'bannieres');
    // Une bannière sans image n'a pas de sens : le mobile n'aurait rien à
    // afficher. On la crée seulement si le visuel est passé.
    if (!image) {
      console.log(`   ignorée faute de visuel : ${banniere.titre}`);
      continue;
    }

    await Banniere.create({
      titre: banniere.titre,
      image,
      ordre: banniere.ordre,
      isActive: true,
    });
    console.log(`   créée : ${banniere.titre}`);
  }

  // ── Sous-sections ───────────────────────────────────────────────────────
  console.log('\nSous-sections');
  for (const bloc of BLOCS) {
    const existant = await BlocPromo.findOne({
      where: { section: bloc.section, titre: bloc.titre },
    });
    if (existant) {
      console.log(`   déjà présente : ${bloc.section} / ${bloc.titre}`);
      continue;
    }

    const image = await televerser(dossierAssets, bloc.fichier, 'blocs-promo');

    await BlocPromo.create({
      section: bloc.section,
      titre: bloc.titre,
      sousTitre: bloc.sousTitre,
      image,
      ordre: bloc.ordre,
      isActive: true,
    });
    console.log(`   créée : ${bloc.section} / ${bloc.titre}`);
  }
}

module.exports = seedSectionsAccueil;

// Exécution directe : `node src/seeders/seed-sections-accueil.js`
if (require.main === module) {
  const dossier = process.argv[2] || ASSETS_PAR_DEFAUT;
  sequelize
    .authenticate()
    .then(() => seedSectionsAccueil(dossier))
    .then(async () => {
      const blocs = await BlocPromo.count();
      const bannieres = await Banniere.count();
      console.log(`\nTerminé — ${bannieres} bannière(s), ${blocs} sous-section(s) en base.`);
      if (uploadsEchoues > 0) {
        console.log(
          `\n${uploadsEchoues} visuel(s) non téléversé(s) : Cloudinary a refusé les identifiants.\n` +
            'Les sous-sections existent sans image ; déposez-les depuis le dashboard,\n' +
            'ou relancez ce script dans un environnement où Cloudinary est configuré.'
        );
      }
      await sequelize.close();
      process.exit(0);
    })
    .catch(async (err) => {
      logger.error('Seed des sections échoué', { error: err.message });
      console.error('\nÉchec :', err.message);
      await sequelize.close();
      process.exit(1);
    });
}
