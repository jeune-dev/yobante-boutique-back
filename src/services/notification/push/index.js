'use strict';

const logger = require('../../../config/logger');
const { DeviceToken } = require('../../../models');
const FcmProvider = require('./fcm.provider');

const fournisseur = new FcmProvider();

/**
 * Pousse une notification vers les appareils d'un utilisateur.
 *
 * Volontairement tolérant aux pannes : une notification est un effet de bord,
 * jamais une raison de faire échouer la commande ou le paiement qui l'a
 * déclenchée. Les erreurs sont journalisées, pas propagées.
 */
async function pousser({ userId, titre, message, donnees = {} }) {
  try {
    const appareils = await DeviceToken.findAll({
      where: { userId },
      attributes: ['token'],
      raw: true,
    });
    if (!appareils.length) return { envoyes: 0, ignores: 0, raison: 'aucun_appareil' };

    return await fournisseur.envoyer({
      tokens: appareils.map((a) => a.token),
      titre,
      message,
      donnees,
    });
  } catch (err) {
    logger.error("Échec de l'envoi push", { error: err.message, userId, titre });
    return { envoyes: 0, ignores: 0, raison: 'erreur' };
  }
}

module.exports = { pousser, estConfigure: FcmProvider.estConfigure };
