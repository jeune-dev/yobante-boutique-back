/**
 * Rayons et sous-rayons de référence, repris de l'accueil de l'application
 * mobile où ils étaient écrits en dur.
 *
 * Partagé par le seeder local (seed-rayons.js) et le seeder distant
 * (scripts/seed-rayons-distant.js) : une seule liste à tenir à jour.
 *
 * L'ordre est celui d'affichage sur l'accueil.
 */
'use strict';

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

module.exports = { RAYONS };
