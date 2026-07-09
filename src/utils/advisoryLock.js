/**
 * PostgreSQL advisory locks — verrous de session non-transactionnels.
 *
 * Utilisé pour sérialiser des opérations critiques (passage de commande,
 * validation en deux étapes) sans bloquer toute la table.
 *
 * pg_try_advisory_lock  → non-bloquant, retourne false si déjà vérouillé
 * pg_advisory_unlock    → libère le verrou
 *
 * La clé doit être un BIGINT PostgreSQL. On hache l'identifiant (UUID ou string)
 * en un entier 32 bits signé pour rester dans les bornes du type.
 */
const { createHash } = require('crypto');
const { sequelize } = require('../models');

function _hashKey(key) {
  const buf = createHash('sha256').update(String(key)).digest();
  // Lit les 4 premiers octets comme un entier 32 bits signé
  return buf.readInt32BE(0);
}

/**
 * Essaie d'acquérir le verrou. Lance une AppError 429 si déjà pris.
 * À appeler en début d'opération ; appeler `release` en finally.
 */
async function acquire(key) {
  const lockKey = _hashKey(key);
  const [{ pg_try_advisory_lock: ok }] = await sequelize.query(
    `SELECT pg_try_advisory_lock(:key)`,
    { replacements: { key: lockKey }, type: sequelize.QueryTypes.SELECT }
  );
  if (!ok) {
    const AppError = require('./AppError');
    throw new AppError(
      'Une opération est déjà en cours pour ce compte. Réessayez dans quelques secondes.',
      429
    );
  }
  return lockKey;
}

async function release(lockKey) {
  try {
    await sequelize.query(`SELECT pg_advisory_unlock(:key)`, {
      replacements: { key: lockKey },
      type: sequelize.QueryTypes.SELECT,
    });
  } catch (_) {
    // Libération best-effort — ne jamais lever ici
  }
}

module.exports = { acquire, release };
