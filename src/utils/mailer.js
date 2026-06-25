const { Resend } = require('resend');
const logger = require('./logger');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

async function sendMail({ to, subject, html }) {
  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      logger.error(`Erreur envoi email à ${to}: ${error.message}`);
      return { success: false, error: error.message };
    }
    logger.info(`Email '${subject}' envoyé à ${to} (id: ${data.id})`);
    return { success: true, id: data.id };
  } catch (err) {
    logger.error(`Erreur envoi email à ${to}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

async function sendOtpEmail(to, code) {
  return sendMail({
    to,
    subject: 'Code de vérification — Yobante Boutique',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto">
        <h2>Vérification de votre email</h2>
        <p>Votre code de vérification est :</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;padding:20px;background:#f4f4f4;border-radius:8px">${code}</div>
        <p style="color:#888;font-size:13px">Ce code expire dans <strong>10 minutes</strong>.</p>
      </div>
    `,
  });
}

async function sendWelcomeEmail(to, nom) {
  return sendMail({
    to,
    subject: 'Bienvenue sur Yobante Boutique !',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto">
        <h2>Bienvenue ${nom} !</h2>
        <p>Votre compte a été créé avec succès sur <strong>Yobante Boutique</strong>.</p>
        <p>Vous pouvez maintenant découvrir nos produits et passer vos commandes.</p>
      </div>
    `,
  });
}

async function sendCommandeConfirmation(to, commande) {
  return sendMail({
    to,
    subject: `Confirmation de commande ${commande.reference}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto">
        <h2>Commande confirmée ✓</h2>
        <p>Merci pour votre commande !</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;color:#888">Référence</td><td style="padding:8px"><strong>${commande.reference}</strong></td></tr>
          <tr><td style="padding:8px;color:#888">Montant total</td><td style="padding:8px"><strong>${commande.montantTotal} FCFA</strong></td></tr>
          <tr><td style="padding:8px;color:#888">Statut</td><td style="padding:8px">En attente de traitement</td></tr>
        </table>
        <p style="color:#888;font-size:13px">Vous recevrez une notification à chaque étape de votre commande.</p>
      </div>
    `,
  });
}

async function sendCommandeStatut(to, commande, statut) {
  return sendMail({
    to,
    subject: `Mise à jour de votre commande ${commande.reference}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto">
        <h2>Votre commande a été mise à jour</h2>
        <p>La commande <strong>${commande.reference}</strong> est maintenant : <strong>${statut}</strong>.</p>
      </div>
    `,
  });
}

async function sendResetPasswordEmail(to, code) {
  return sendMail({
    to,
    subject: 'Réinitialisation de votre mot de passe — Yobante Boutique',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto">
        <h2>Réinitialisation du mot de passe</h2>
        <p>Votre code de réinitialisation est :</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;padding:20px;background:#f4f4f4;border-radius:8px">${code}</div>
        <p style="color:#888;font-size:13px">Ce code expire dans <strong>10 minutes</strong>. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      </div>
    `,
  });
}

module.exports = {
  sendMail,
  sendOtpEmail,
  sendWelcomeEmail,
  sendCommandeConfirmation,
  sendCommandeStatut,
  sendResetPasswordEmail,
};
