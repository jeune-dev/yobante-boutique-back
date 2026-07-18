// ─────────────────────────────────────────────────────────────
// seeders/blocPromoSeeder.js
// Crée (si absentes) les 3 lignes de blocs promo, une par section.
// Idempotent : ne recrée pas ce qui existe déjà.
// ─────────────────────────────────────────────────────────────
const { BlocPromo } = require('../models');

const BLOCS = [
  { section: 'nos_promos_du_moment', titre: 'Nos promos du moment', ordre: 0 },
  { section: 'a_ne_pas_rater', titre: 'À ne pas rater', ordre: 1 },
  { section: 'nos_promos_a_venir', titre: 'Nos promos à venir', ordre: 2 },
];

module.exports = async function seedBlocsPromo() {
  for (const bloc of BLOCS) {
    await BlocPromo.findOrCreate({
      where: { section: bloc.section },
      defaults: bloc,
    });
  }
};
