const { UniqueConstraintError } = require('sequelize');

/**
 * Réessaie la fonction `fn` jusqu'à `maxRetries` fois en cas de UniqueConstraintError.
 * Utile pour les colonnes avec génération de numéro unique (référence commande, etc.)
 * où une collision de course est possible sous charge.
 */
const retryOnUniqueConflict = async (fn, maxRetries = 3) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof UniqueConstraintError && attempt < maxRetries - 1) {
        attempt++;
        continue;
      }
      throw err;
    }
  }
};

module.exports = { retryOnUniqueConflict };
