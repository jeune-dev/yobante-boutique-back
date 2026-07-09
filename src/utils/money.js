/**
 * Arithmétique monétaire — tous les montants en centimes (entiers) pour éviter
 * les erreurs de représentation flottante de JavaScript (0.1 + 0.2 ≠ 0.3).
 *
 * Règle : on travaille en centimes en interne, on arrondit au centime le plus proche
 * avant tout stockage en base ou envoi en réponse API.
 */

/** Arrondit un montant numérique à 2 décimales (retourne un Number, pas un string). */
function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

/**
 * Calcule le sous-total d'une ligne de commande.
 * @param {number|string} prixUnitaire
 * @param {number} quantite
 * @returns {number}
 */
function sousTotal(prixUnitaire, quantite) {
  return round2((Math.round(Number(prixUnitaire) * 100) * quantite) / 100);
}

/**
 * Calcule le montant total d'une commande.
 * @param {Array<{prix: number|string, quantite: number}>} lignes
 * @param {number} fraisLivraison
 * @returns {{ lignesTotal: number, montantTotal: number }}
 */
function totalCommande(lignes, fraisLivraison = 0) {
  // Accumulation en centimes pour éviter les erreurs cumulatives
  const lignesTotal = round2(
    lignes.reduce((sum, l) => sum + Math.round(Number(l.prix) * 100) * l.quantite, 0) / 100
  );
  const montantTotal = round2(lignesTotal + Number(fraisLivraison));
  return { lignesTotal, montantTotal };
}

module.exports = { round2, sousTotal, totalCommande };
