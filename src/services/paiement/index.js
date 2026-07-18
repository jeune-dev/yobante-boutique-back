'use strict';

const logger = require('../../config/logger');
const { METHODE_PAIEMENT } = require('../../constants');
const SimulationProvider = require('./providers/simulation.provider');
const CashProvider = require('./providers/cash.provider');
const ExterneProvider = require('./providers/externe.provider');

/**
 * Sélection du fournisseur de paiement.
 *
 * `PAIEMENT_MODE` :
 *   - 'simulation' (défaut) : les méthodes en ligne passent par le fournisseur
 *     de substitution, en attendant les APIs réelles ;
 *   - 'reel' : les méthodes en ligne exigent une intégration effective, et
 *     échouent proprement tant qu'elle n'existe pas.
 *
 * Le paiement à la livraison ne dépend d'aucun tiers : il garde toujours son
 * propre fournisseur, quel que soit le mode.
 */
const MODE = () => (process.env.PAIEMENT_MODE || 'simulation').toLowerCase();

const estSimulation = () => MODE() === 'simulation';

let alerteEmise = false;

function resoudreFournisseur(methode) {
  if (methode === METHODE_PAIEMENT.CASH_LIVRAISON) return new CashProvider(methode);

  if (estSimulation()) {
    // Un encaissement simulé en production laisserait croire à un paiement
    // réel : on le signale à chaque démarrage, une seule fois.
    if (process.env.NODE_ENV === 'production' && !alerteEmise) {
      alerteEmise = true;
      logger.warn(
        'PAIEMENT_MODE=simulation en production : aucun encaissement réel ' +
          "n'est effectué pour les paiements en ligne."
      );
    }
    return new SimulationProvider(methode);
  }

  return new ExterneProvider(methode);
}

module.exports = { resoudreFournisseur, estSimulation };
