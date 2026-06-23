// ─────────────────────────────────────────────────────────────
// utils/mailer.js — Service d'envoi d'emails (Resend ou Nodemailer)
// ─────────────────────────────────────────────────────────────

// TODO: sendMail({ to, subject, html })
//   - Utiliser Resend (ou nodemailer selon config)
//   - Logger un message en cas d'échec sans planter l'app
//   - Retourner le résultat

// TODO: sendOtpEmail(to, code)       — template OTP
// TODO: sendWelcomeEmail(to, nom)    — template bienvenue
// TODO: sendCommandeConfirmation(to, commande) — template confirmation commande
// TODO: sendCommandeStatut(to, commande, statut) — template changement statut
// TODO: sendResetPasswordEmail(to, code) — template reset mot de passe
