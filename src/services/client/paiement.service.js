'use strict';

const { Commande, Paiement, sequelize } = require('../../models');
const { resoudreFournisseur } = require('../paiement');
const NotificationService = require('../notification');
const logger = require('../../config/logger');
const { STATUT_PAIEMENT, STATUT_COMMANDE } = require('../../constants');

/**
 * Paiement d'une commande côté client.
 *
 * `passerCommande` crée déjà le paiement en attente avec la méthode choisie ;
 * ce service en pilote l'exécution : initiation auprès du fournisseur, prise
 * en compte du callback, et réconciliation à la demande.
 */
class PaiementClientService {
  /** Statuts de commande pour lesquels un paiement n'a plus de sens. */
  static #estCloturee(commande) {
    return commande.statut === STATUT_COMMANDE.ANNULEE;
  }

  /**
   * Démarre le paiement et renvoie de quoi le poursuivre côté client.
   * Idempotent : relancer sur un paiement déjà réussi ne réencaisse rien.
   */
  static async initier(userId, commandeId, urlBase) {
    const commande = await Commande.findOne({
      where: { id: commandeId, userId },
      include: [{ model: Paiement, as: 'paiement' }],
    });
    if (!commande) return { success: false, status: 404, message: 'Commande introuvable' };
    if (this.#estCloturee(commande)) {
      return { success: false, status: 400, message: 'Cette commande est annulée' };
    }

    const paiement = commande.paiement;
    if (!paiement) {
      return { success: false, status: 400, message: 'Aucun paiement associé à cette commande' };
    }
    if (paiement.statut === STATUT_PAIEMENT.SUCCES) {
      return { success: false, status: 409, message: 'Cette commande est déjà payée' };
    }
    if (paiement.statut === STATUT_PAIEMENT.REMBOURSE) {
      return { success: false, status: 409, message: 'Ce paiement a été remboursé' };
    }

    const fournisseur = resoudreFournisseur(paiement.methode);
    const resultat = await fournisseur.initier({ paiement, commande, urlBase });

    await paiement.update({
      transactionId: resultat.reference,
      urlPaiement: resultat.urlPaiement,
      fournisseur: fournisseur.nom,
      statut: STATUT_PAIEMENT.EN_ATTENTE,
      derniereErreur: null,
    });

    // Paiement à la livraison : rien à encaisser en ligne, la commande peut
    // avancer immédiatement.
    if (resultat.confirmerCommande && commande.statut === STATUT_COMMANDE.EN_ATTENTE) {
      await commande.update({ statut: STATUT_COMMANDE.VALIDEE });
    }

    return {
      success: true,
      message: resultat.urlPaiement
        ? 'Paiement initié'
        : 'Commande confirmée — paiement à la livraison',
      paiement: {
        id: paiement.id,
        methode: paiement.methode,
        statut: paiement.statut,
        montant: paiement.montant,
        reference: resultat.reference,
        urlPaiement: resultat.urlPaiement,
      },
    };
  }

  /** État courant du paiement, pour l'écran de suivi côté mobile. */
  static async statut(userId, commandeId) {
    const commande = await Commande.findOne({
      where: { id: commandeId, userId },
      include: [{ model: Paiement, as: 'paiement' }],
    });
    if (!commande || !commande.paiement) {
      return { success: false, status: 404, message: 'Paiement introuvable' };
    }

    const p = commande.paiement;
    return {
      success: true,
      paiement: {
        id: p.id,
        methode: p.methode,
        statut: p.statut,
        montant: p.montant,
        reference: p.transactionId,
        urlPaiement: p.urlPaiement,
        payeAt: p.payeAt,
        statutCommande: commande.statut,
      },
    };
  }

  /**
   * Prise en compte d'une notification du fournisseur.
   *
   * Transactionnel et idempotent : un fournisseur peut rejouer le même
   * callback plusieurs fois, et ne doit jamais produire deux encaissements ni
   * faire régresser un paiement déjà abouti.
   */
  static async traiterCallback({ reference, succes, signature, corps }) {
    const paiement = await Paiement.findOne({ where: { transactionId: reference } });
    if (!paiement) return { success: false, status: 404, message: 'Transaction inconnue' };

    const fournisseur = resoudreFournisseur(paiement.methode);
    if (!fournisseur.verifierSignature({ signature, corps })) {
      logger.warn('Callback de paiement rejeté : signature invalide', { reference });
      return { success: false, status: 401, message: 'Signature invalide' };
    }

    if (paiement.statut === STATUT_PAIEMENT.SUCCES) {
      return { success: true, message: 'Paiement déjà confirmé', paiement };
    }

    await sequelize.transaction(async (t) => {
      if (succes) {
        await paiement.update(
          { statut: STATUT_PAIEMENT.SUCCES, payeAt: new Date(), derniereErreur: null },
          { transaction: t }
        );
        // Un paiement abouti fait avancer la commande, sans écraser un état
        // plus avancé (expédiée, livrée) ni ressusciter une commande annulée.
        const commande = await Commande.findByPk(paiement.commandeId, { transaction: t });
        if (commande && commande.statut === STATUT_COMMANDE.EN_ATTENTE) {
          await commande.update({ statut: STATUT_COMMANDE.VALIDEE }, { transaction: t });
        }
      } else {
        await paiement.update(
          { statut: STATUT_PAIEMENT.ECHOUE, derniereErreur: 'Paiement refusé par le fournisseur' },
          { transaction: t }
        );
      }
    });

    await paiement.reload();

    await NotificationService.emettre({
      userId: paiement.userId,
      titre: succes ? 'Paiement confirmé' : 'Paiement refusé',
      message: succes
        ? `Votre règlement de ${paiement.montant} FCFA a bien été reçu.`
        : 'Votre règlement n’a pas abouti. Vous pouvez réessayer depuis la commande.',
      type: 'paiement',
      donnees: { commandeId: paiement.commandeId },
    });

    return {
      success: true,
      message: succes ? 'Paiement confirmé' : 'Paiement refusé',
      paiement,
    };
  }
}

module.exports = PaiementClientService;
