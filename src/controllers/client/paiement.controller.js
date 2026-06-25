const paiementService = require('../../services/client/paiement.service');
const { success } = require('../../utils/formatResponse');

async function initier(req, res, next) {
  try {
    const result = await paiementService.initierPaiement(req.user.id, req.params.commandeId);
    return success(res, result, 'URL de paiement générée');
  } catch (err) {
    next(err);
  }
}

async function webhook(req, res, next) {
  try {
    await paiementService.traiterWebhook(req.body);
    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function retour(req, res) {
  return res.status(200).json({ success: true, message: 'Paiement effectué, merci pour votre commande.' });
}

async function annulation(req, res) {
  return res.status(200).json({ success: false, message: 'Paiement annulé.' });
}

module.exports = { initier, webhook, retour, annulation };
