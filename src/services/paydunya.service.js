const axios = require('axios');

const BASE_URL = {
  test: 'https://app.paydunya.com/sandbox-api/v1',
  live: 'https://app.paydunya.com/api/v1',
};

function getHeaders() {
  return {
    'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY,
    'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY,
    'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN,
    'PAYDUNYA-PUBLIC-KEY': process.env.PAYDUNYA_PUBLIC_KEY,
    'Content-Type': 'application/json',
  };
}

function getBaseUrl() {
  return BASE_URL[process.env.PAYDUNYA_MODE || 'test'];
}

async function creerFacture({ commande, client }) {
  const payload = {
    invoice: {
      items: {
        item_0: {
          name: `Commande ${commande.reference}`,
          quantity: 1,
          unit_price: Number(commande.montantTotal),
          total_price: Number(commande.montantTotal),
          description: `Commande Yobante Boutique réf. ${commande.reference}`,
        },
      },
      taxes: {},
      total_amount: Number(commande.montantTotal),
      description: `Paiement commande ${commande.reference}`,
    },
    store: {
      name: 'Yobante Boutique',
    },
    actions: {
      cancel_url: `${process.env.APP_URL}/api/paiement/cancel`,
      return_url: `${process.env.APP_URL}/api/paiement/return`,
      callback_url: `${process.env.APP_URL}/api/paiement/webhook`,
    },
    customer: {
      name: `${client.prenom} ${client.nom}`,
      email: client.email,
      phone: client.telephone || '',
    },
    custom_data: {
      commandeId: commande.id,
      commandeReference: commande.reference,
    },
  };

  const { data } = await axios.post(
    `${getBaseUrl()}/checkout-invoice/create`,
    payload,
    { headers: getHeaders() }
  );

  if (data.response_code !== '00') {
    const error = new Error(data.response_text || 'Erreur PayDunya lors de la création de la facture');
    error.status = 502;
    throw error;
  }

  return {
    token: data.token,
    urlPaiement: data.response_text,
  };
}

async function verifierPaiement(token) {
  const { data } = await axios.get(
    `${getBaseUrl()}/checkout-invoice/confirm/${token}`,
    { headers: getHeaders() }
  );

  return {
    statut: data.status,
    montant: data.invoice?.total_amount,
    token: data.token,
    custom_data: data.custom_data,
  };
}

module.exports = { creerFacture, verifierPaiement };
