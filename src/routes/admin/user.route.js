// ─────────────────────────────────────────────────────────────
// routes/admin/user.route.js   — Préfixe : /api/admin/users
// ─────────────────────────────────────────────────────────────
const router = require('express').Router();
const ctrl = require('../../controllers/admin/user.controller');
const adminMiddleware = require('../../middlewares/admin.middleware');
const validate = require('../../middlewares/validate.middleware');
const { creerAdminSchema, modifierAdminSchema } = require('../../validations/admin.validation');

// ── Admins ──────────────────────────────────────────────────────────────────
router.get('/admins', adminMiddleware, ctrl.listeAdmins);
router.post('/admins', adminMiddleware, validate(creerAdminSchema), ctrl.ajouterAdmin);
router.put('/admins/:id', adminMiddleware, validate(modifierAdminSchema), ctrl.modifierAdmin);
router.delete('/admins/:id', adminMiddleware, ctrl.supprimerAdmin);
router.patch('/admins/:id/toggle', adminMiddleware, ctrl.toggleActivationAdmin);

// ── Clients ─────────────────────────────────────────────────────────────────
router.get('/clients', adminMiddleware, ctrl.listeClients);
router.get('/clients/count', adminMiddleware, ctrl.nombreClients);
router.get('/clients/export', adminMiddleware, ctrl.exportClients);
router.patch('/clients/:id/activer', adminMiddleware, ctrl.activerClient);
router.patch('/clients/:id/desactiver', adminMiddleware, ctrl.desactiverClient);

module.exports = router;
