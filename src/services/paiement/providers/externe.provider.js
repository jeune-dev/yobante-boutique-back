'use strict';

// Contrat asynchrone commun aux fournisseurs — voir simulation.provider.js.
/* eslint-disable require-await */

/**
 * Emplacement d'intégration des fournisseurs réels (Wave, Orange Money, carte).
 *
 * Le contrat à respecter est celui de SimulationProvider :
 *
 *   initier({ paiement, commande, urlBase })
 *     → { reference, urlPaiement, statut }
 *       `statut` vaut 'en_attente' : la confirmation arrive par callback.
 *
 *   verifier({ paiement })
 *     → { reference, statut }   (appel de réconciliation auprès du fournisseur)
 *
 *   verifierSignature({ signature, corps })
 *     → bool                    (authentification du callback entrant)
 *
 * Tant qu'une implémentation n'est pas fournie, ce module échoue explicitement
 * plutôt que de laisser croire qu'un encaissement a eu lieu.
 */
class ExterneProvider {
  constructor(methode) {
    this.methode = methode;
    this.nom = methode;
  }

  #nonConfigure() {
    const erreur = new Error(
      `Le paiement ${this.methode} n'est pas encore disponible. ` +
        `Choisissez le paiement à la livraison.`
    );
    erreur.statusCode = 503;
    erreur.isOperational = true;
    return erreur;
  }

  async initier() {
    throw this.#nonConfigure();
  }

  async verifier() {
    throw this.#nonConfigure();
  }

  verifierSignature() {
    return false;
  }
}

module.exports = ExterneProvider;
