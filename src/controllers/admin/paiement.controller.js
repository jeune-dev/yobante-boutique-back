const GestionPaiementService = require('../../services/admin/paiement.service');
const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const { BadRequestError, NotFoundError } = require('../../errors/AppError');

exports.getAll = asyncHandler(async (req, res) => {
  const result = await GestionPaiementService.getAllPaiements(req.query);
  return ok(
    res,
    { paiements: result.paiements, pagination: result.pagination },
    'Paiements récupérés'
  );
});

exports.getOne = asyncHandler(async (req, res) => {
  const result = await GestionPaiementService.getPaiementById(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { paiement: result.paiement }, 'Paiement récupéré');
});

exports.confirmer = asyncHandler(async (req, res) => {
  const result = await GestionPaiementService.confirmerPaiement(
    req.params.id,
    req.body.transactionId
  );
  if (!result.success) throw new BadRequestError(result.message);
  return ok(res, { paiement: result.paiement }, result.message);
});

exports.getRevenusTotal = asyncHandler(async (req, res) => {
  const result = await GestionPaiementService.getRevenusTotal(req.query);
  return ok(
    res,
    { total: result.total, nbTransactions: result.nbTransactions },
    'Revenus récupérés'
  );
});

exports.rembourser = asyncHandler(async (req, res) => {
  const result = await GestionPaiementService.rembourserPaiement(req.params.id, req.body.raison);
  if (!result.success) throw new BadRequestError(result.message);
  return ok(res, { paiement: result.paiement }, result.message);
});
