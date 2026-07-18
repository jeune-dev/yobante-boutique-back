'use strict';

// Les méthodes restent asynchrones sans `await` : c'est le contrat commun à
// tous les fournisseurs, et les implémentations réelles feront des appels
// réseau. Les aligner sur ce fournisseur-ci figerait l'interface en synchrone.
/* eslint-disable require-await */

const crypto = require('crypto');

/**
 * Fournisseur de substitution, utilisé tant que les APIs réelles (Wave,
 * Orange Money, carte) ne sont pas disponibles.
 *
 * Il respecte exactement le contrat attendu des vrais fournisseurs : une
 * initiation qui renvoie une référence et une URL, puis une confirmation
 * asynchrone via callback signé. Basculer sur un vrai fournisseur ne demandera
 * donc aucun changement dans le service métier ni côté mobile.
 */
class SimulationProvider {
  constructor(methode) {
    this.methode = methode;
    this.nom = 'simulation';
  }

  /**
   * Réserve une transaction et renvoie de quoi poursuivre le paiement.
   * L'URL pointe vers notre propre page de simulation, pas vers un tiers.
   */
  async initier({ paiement, commande, urlBase }) {
    const reference = `SIM-${commande.reference}-${crypto.randomBytes(4).toString('hex')}`;
    return {
      reference,
      // Le client ouvre cette page pour confirmer ou refuser le paiement.
      urlPaiement: `${urlBase}/api/v1/paiements/simulation/${reference}`,
      // Un vrai fournisseur répond « en attente » : la confirmation arrive
      // par callback, jamais dans la réponse d'initiation.
      statut: 'en_attente',
    };
  }

  /**
   * Vérifie l'état d'une transaction auprès du fournisseur.
   * En simulation, l'état fait foi côté base : on ne sait rien de plus.
   */
  async verifier({ paiement }) {
    return { reference: paiement.transactionId, statut: paiement.statut };
  }

  /**
   * Contrôle l'authenticité d'un callback.
   * Les vrais fournisseurs signent leur charge utile ; ici on exige un secret
   * partagé pour que la route ne soit pas déclenchable par n'importe qui.
   */
  verifierSignature({ signature }) {
    const secret = process.env.PAIEMENT_SIMULATION_SECRET;
    if (!secret) return false;
    const attendu = Buffer.from(secret);
    const recu = Buffer.from(String(signature || ''));
    return attendu.length === recu.length && crypto.timingSafeEqual(attendu, recu);
  }
}

module.exports = SimulationProvider;
