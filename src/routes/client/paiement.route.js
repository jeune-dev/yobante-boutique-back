// ─────────────────────────────────────────────────────────────
// routes/client/paiement.route.js   — Préfixe : /api/v1/paiements
//
// Routes publiques : elles sont appelées par le fournisseur de paiement, pas
// par l'application. L'authentification repose sur la signature du callback.
// ─────────────────────────────────────────────────────────────
const router = require('express').Router();
const ctrl = require('../../controllers/client/paiement.controller');
const PaiementClientService = require('../../services/client/paiement.service');
const { estSimulation } = require('../../services/paiement');
const asyncHandler = require('../../utils/asyncHandler');
const { NotFoundError } = require('../../errors/AppError');

router.post('/callback', ctrl.callback);

// ── Page de simulation ────────────────────────────────────────────────────
// Remplace le tiers tant que les APIs réelles ne sont pas disponibles : elle
// tient le rôle de la page de paiement vers laquelle le client est redirigé.
// Fermée dès que PAIEMENT_MODE bascule sur 'reel'.
const simulationActive = (_req, _res, next) => {
  if (!estSimulation()) return next(new NotFoundError('Page introuvable'));
  next();
};

const echapper = (valeur) =>
  String(valeur).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );

router.get(
  '/simulation/:reference',
  simulationActive,
  asyncHandler((req, res) => {
    const reference = echapper(req.params.reference);
    res.type('html').send(`<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Paiement Yobante</title>
<style>
 body{font-family:system-ui,sans-serif;background:#F5F7FB;margin:0;padding:32px;color:#1A1A1A}
 .carte{max-width:420px;margin:40px auto;background:#fff;border:1px solid #DDE3EF;
        border-radius:16px;padding:24px}
 .ref{font-size:12px;color:#6B7280;word-break:break-all;margin-bottom:20px}
 button{width:100%;padding:14px;border:0;border-radius:12px;font-size:15px;
        font-weight:700;cursor:pointer;margin-bottom:10px}
 .ok{background:#163A9E;color:#fff}.ko{background:#F3F4F6;color:#E53935}
 .avis{background:#FFF7E6;border:1px solid #F5C518;border-radius:10px;
       padding:10px;font-size:12.5px;margin-bottom:18px}
</style></head><body>
<div class="carte">
  <div class="avis">Environnement de simulation — aucun montant n'est réellement débité.</div>
  <h2 style="margin:0 0 6px">Confirmer le paiement</h2>
  <div class="ref">Référence : ${reference}</div>
  <form method="post"><button class="ok" name="succes" value="true">Payer</button></form>
  <form method="post"><button class="ko" name="succes" value="false">Refuser</button></form>
</div></body></html>`);
  })
);

router.post(
  '/simulation/:reference',
  simulationActive,
  asyncHandler(async (req, res) => {
    // Le secret reste côté serveur : la page ne le manipule jamais.
    const resultat = await PaiementClientService.traiterCallback({
      reference: req.params.reference,
      succes: req.body.succes === 'true',
      signature: process.env.PAIEMENT_SIMULATION_SECRET,
      corps: req.body,
    });

    const abouti = resultat.success && req.body.succes === 'true';
    res.type('html').send(`<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Paiement Yobante</title>
<style>
 body{font-family:system-ui,sans-serif;background:#F5F7FB;margin:0;padding:32px;
      text-align:center;color:#1A1A1A}
 .etat{font-size:19px;font-weight:800;margin-top:60px;
       color:${abouti ? '#1B9C6B' : '#E53935'}}
 p{color:#6B7280;font-size:14px}
</style></head><body>
<div class="etat">${abouti ? 'Paiement confirmé' : 'Paiement refusé'}</div>
<p>${echapper(resultat.message || '')}</p>
<p>Vous pouvez revenir à l'application.</p>
</body></html>`);
  })
);

module.exports = router;
