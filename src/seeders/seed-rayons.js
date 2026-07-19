/**
 * Verse en base les rayons aujourd'hui figés dans l'application mobile, avec
 * leurs sous-rayons.
 *
 * L'accueil mobile affichait une liste écrite en dur : impossible d'en ajouter
 * un sans republier l'application. Une fois en base, l'administration en
 * reprend la main depuis le dashboard.
 *
 * Idempotent : un rayon déjà présent (même slug) est laissé tel quel, et seuls
 * ses sous-rayons manquants sont ajoutés.
 *
 * Usage : node src/seeders/seed-rayons.js
 */
require('dotenv').config();

const sequelize = require('../config/db');
const { Rayon, SousRayon } = require('../models');
const logger = require('../config/logger');

/** Reprend l'ordre d'affichage de l'accueil mobile. */
const RAYONS = [
  { nom: 'Bébé', sousRayons: ['Couches', 'Laits infantiles', 'Petits pots', 'Soins bébé'] },
  { nom: 'Dépannage', sousRayons: ['Piles', 'Ampoules', 'Petit outillage', 'Adaptateurs'] },
  {
    nom: 'Petfood & Animalerie',
    sousRayons: ['Croquettes chien', 'Croquettes chat', 'Litière', 'Accessoires'],
  },
  { nom: 'Boissons', sousRayons: ['Eaux', 'Sodas', 'Jus de fruits', 'Boissons chaudes'] },
  { nom: "Petit-déj'", sousRayons: ['Céréales', 'Confitures', 'Biscottes', 'Café & thé'] },
  { nom: 'Boulangerie', sousRayons: ['Pains', 'Viennoiseries', 'Pâtisseries'] },
  {
    nom: 'Huiles, Sauces & Épices',
    sousRayons: ['Huiles', 'Vinaigres', 'Sauces', 'Épices & condiments'],
  },
  {
    nom: 'Pâtes, Riz & Céréales',
    sousRayons: ['Riz', 'Pâtes', 'Semoule & couscous', 'Légumes secs'],
  },
  { nom: 'Frais & Surgelés', sousRayons: ['Produits laitiers', 'Viandes', 'Poissons', 'Surgelés'] },
  { nom: 'Fruits & Légumes', sousRayons: ['Fruits frais', 'Légumes frais', 'Herbes aromatiques'] },
  { nom: 'Snacking', sousRayons: ['Biscuits', 'Chips & apéritif', 'Confiseries', 'Chocolats'] },
  {
    nom: 'Conserves',
    sousRayons: ['Légumes en conserve', 'Poissons en conserve', 'Plats cuisinés'],
  },
  {
    nom: 'Entretien Maison',
    sousRayons: ['Lessive', 'Vaisselle', 'Nettoyants', 'Papier & essuie-tout'],
  },
  {
    nom: 'Hygiène & Beauté',
    sousRayons: ['Soins du corps', 'Soins du visage', 'Cheveux', 'Hygiène dentaire'],
  },
  { nom: 'Adulte', sousRayons: ['Protection', 'Bien-être'] },
];

/** Slug simple et stable : c'est la clé d'idempotence du script. */
function slugifier(texte) {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function seedRayons() {
  let rayonsCrees = 0;
  let sousRayonsCrees = 0;

  for (const [index, definition] of RAYONS.entries()) {
    const slug = slugifier(definition.nom);

    const [rayon, cree] = await Rayon.findOrCreate({
      where: { slug },
      defaults: { nom: definition.nom, slug, isActive: true },
    });

    if (cree) {
      rayonsCrees++;
      console.log(`   rayon créé : ${definition.nom}`);
    } else {
      console.log(`   déjà présent : ${definition.nom}`);
    }

    for (const nomSousRayon of definition.sousRayons) {
      // Le slug d'un sous-rayon est préfixé par son rayon : « Surgelés » peut
      // exister dans plusieurs rayons sans collision d'unicité.
      const slugSousRayon = `${slug}-${slugifier(nomSousRayon)}`;

      const [, sousCree] = await SousRayon.findOrCreate({
        where: { slug: slugSousRayon },
        defaults: {
          nom: nomSousRayon,
          slug: slugSousRayon,
          rayonId: rayon.id,
          isActive: true,
        },
      });
      if (sousCree) sousRayonsCrees++;
    }

    // `ordre` n'existe pas sur le modèle : l'ordre d'affichage suit la
    // création, d'où le parcours séquentiel plutôt qu'en parallèle.
    void index;
  }

  return { rayonsCrees, sousRayonsCrees };
}

module.exports = seedRayons;

if (require.main === module) {
  sequelize
    .authenticate()
    .then(() => {
      console.log('Rayons');
      return seedRayons();
    })
    .then(async ({ rayonsCrees, sousRayonsCrees }) => {
      const totalRayons = await Rayon.count();
      const totalSous = await SousRayon.count();
      console.log(
        `\nTerminé — ${rayonsCrees} rayon(s) et ${sousRayonsCrees} sous-rayon(s) créés.` +
          `\nEn base : ${totalRayons} rayons, ${totalSous} sous-rayons.`
      );
      await sequelize.close();
      process.exit(0);
    })
    .catch(async (err) => {
      logger.error('Seed des rayons échoué', { error: err.message });
      console.error('\nÉchec :', err.message);
      await sequelize.close();
      process.exit(1);
    });
}
