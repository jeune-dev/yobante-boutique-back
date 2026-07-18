'use strict';

// Contrat asynchrone commun aux fournisseurs push.
/* eslint-disable require-await */

const logger = require('../../../config/logger');

/**
 * Emplacement d'intégration de Firebase Cloud Messaging.
 *
 * Tant qu'aucun identifiant n'est fourni, l'envoi est journalisé au lieu d'être
 * effectué : l'application reste fonctionnelle (la notification est bien
 * enregistrée en base et visible dans l'app), seule la poussée hors ligne
 * manque.
 *
 * Pour activer :
 *   1. créer le projet Firebase et récupérer un compte de service ;
 *   2. renseigner FCM_PROJECT_ID et FCM_CREDENTIALS (JSON du compte de service) ;
 *   3. implémenter `envoyer` avec firebase-admin.
 */
class FcmProvider {
  constructor() {
    this.nom = 'fcm';
  }

  static estConfigure() {
    return Boolean(process.env.FCM_PROJECT_ID && process.env.FCM_CREDENTIALS);
  }

  /**
   * @param {object} params
   * @param {string[]} params.tokens  jetons des appareils du destinataire
   * @param {string} params.titre
   * @param {string} params.message
   * @param {object} params.donnees  charge utile pour ouvrir le bon écran
   */
  async envoyer({ tokens, titre }) {
    if (!FcmProvider.estConfigure()) {
      logger.debug('Push non envoyé : FCM non configuré', {
        titre,
        appareils: tokens.length,
      });
      return { envoyes: 0, ignores: tokens.length, raison: 'fcm_non_configure' };
    }

    // À implémenter avec firebase-admin :
    //   admin.messaging().sendEachForMulticast({ tokens, notification, data })
    throw new Error("FCM est configuré mais l'envoi n'est pas encore implémenté");
  }
}

module.exports = FcmProvider;
