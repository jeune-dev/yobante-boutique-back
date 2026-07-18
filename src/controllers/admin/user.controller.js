// ─────────────────────────────────────────────────────────────
// controllers/admin/user.controller.js
// ─────────────────────────────────────────────────────────────
const GestionAdminService = require('../../services/admin/admin.service');
const GestionUserService = require('../../services/admin/user.service');
const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');
const { BadRequestError, NotFoundError } = require('../../errors/AppError');
const formatUser = require('../../utils/formatUser');

// ──────────────────────────── ROUTE UNIFIÉE ────────────────────────────────

exports.getAll = asyncHandler(async (req, res) => {
  const { search, page, limit } = req.query;
  const result = await GestionUserService.listerClients({ search, page, limit });
  return ok(
    res,
    { users: result.clients.map(formatUser), pagination: result.pagination },
    result.message
  );
});

exports.toggleActivation = asyncHandler(async (req, res) => {
  const user = await require('../../models').User.findByPk(req.params.id);
  if (!user) throw new NotFoundError('Utilisateur introuvable');
  await user.update({ isActive: !user.isActive });
  return ok(res, { user: formatUser(user) }, `Compte ${user.isActive ? 'activé' : 'désactivé'}`);
});

// ──────────────────────────── ADMINS ───────────────────────────────────────

exports.listeAdmins = asyncHandler(async (req, res) => {
  const result = await GestionAdminService.listerAdmins({
    page: req.query.page,
    limit: req.query.limit,
  });
  return ok(
    res,
    { admins: result.admins.map(formatUser), pagination: result.pagination },
    result.message
  );
});

exports.ajouterAdmin = asyncHandler(async (req, res) => {
  const { nom, prenom, email, password, telephone } = req.body;
  const result = await GestionAdminService.ajouterAdmin({
    nom,
    prenom,
    email,
    password,
    telephone,
  });
  if (!result.success) throw new BadRequestError(result.message);
  return created(res, { admin: formatUser(result.admin) }, result.message);
});

exports.supprimerAdmin = asyncHandler(async (req, res) => {
  const result = await GestionAdminService.supprimerAdmin(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, {}, result.message);
});

exports.modifierAdmin = asyncHandler(async (req, res) => {
  const { nom, prenom, telephone } = req.body;
  const result = await GestionAdminService.modifierAdmin(req.params.id, { nom, prenom, telephone });
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { admin: formatUser(result.admin) }, result.message);
});

exports.toggleActivationAdmin = asyncHandler(async (req, res) => {
  const result = await GestionAdminService.toggleActivationAdmin(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { admin: formatUser(result.admin) }, result.message);
});

// ──────────────────────────── CLIENTS ──────────────────────────────────────

exports.listeClients = asyncHandler(async (req, res) => {
  const result = await GestionUserService.listerClients({
    page: req.query.page,
    limit: req.query.limit,
  });
  return ok(
    res,
    { clients: result.clients.map(formatUser), pagination: result.pagination },
    result.message
  );
});

exports.nombreClients = asyncHandler(async (req, res) => {
  const result = await GestionUserService.nombreClients();
  return ok(res, { totalClients: result.totalClients }, result.message);
});

exports.exportClients = asyncHandler(async (req, res) => {
  const result = await GestionUserService.exportUsers();
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="clients-${Date.now()}.csv"`);
  return res.status(200).send(result.csv);
});

exports.activerClient = asyncHandler(async (req, res) => {
  const result = await GestionUserService.activerUser(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { client: formatUser(result.user) }, result.message);
});

exports.desactiverClient = asyncHandler(async (req, res) => {
  const result = await GestionUserService.desactiverUser(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { client: formatUser(result.user) }, result.message);
});
