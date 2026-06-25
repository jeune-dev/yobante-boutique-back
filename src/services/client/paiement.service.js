const { Paiement, Commande, User } = require('../../models');
const paydunya = require('../paydunya.service');
const mailer = require('../../utils/mailer');

async function initierPaiement(userId, commandeId) {
  const commande = await Commande.findOne({ where: { id: commandeId, userId } });
  if (!commande) {
    const error = new Error('Commande introuvable');
    error.status = 404;
    throw error;
  }

  if (commande.statut !== 'en_attente') {
    const error = new Error('Cette commande ne peut plus être payée');
    error.status = 400;
    throw error;
  }

  const paiement = await Paiement.findOne({ where: { commandeId } });
  if (!paiement) {
    const error = new Error('Paiement introuvable pour cette commande');
    error.status = 404;
    throw error;
  }

  if (paiement.methode === 'cash_livraison') {
    const error = new Error('Le paiement à la livraison ne nécessite pas de paiement en ligne');
    error.status = 400;
    throw error;
  }

  const client = await User.findByPk(userId);
  const { token, urlPaiement } = await paydunya.creerFacture({ commande, client });

  paiement.transactionId = token;
  await paiement.save();

  return { urlPaiement, token };
}

async function traiterWebhook(body) {
  const { data } = body;
  if (!data) return;

  const token = data.token || body.token;
  if (!token) return;

  const confirmation = await paydunya.verifierPaiement(token);
  const commandeId = confirmation.custom_data?.commandeId;
  if (!commandeId) return;

  const paiement = await Paiement.findOne({ where: { commandeId } });
  if (!paiement) return;

  if (confirmation.statut === 'completed') {
    paiement.statut = 'succes';
    paiement.payeAt = new Date();
    await paiement.save();

    const commande = await Commande.findByPk(commandeId);
    if (commande) {
      commande.statut = 'validee';
      await commande.save();

      const user = await User.findByPk(commande.userId);
      if (user) await mailer.sendCommandeStatut(user.email, commande, 'validée');
    }
  } else if (confirmation.statut === 'cancelled') {
    paiement.statut = 'echoue';
    await paiement.save();
  }
}

module.exports = { initierPaiement, traiterWebhook };
