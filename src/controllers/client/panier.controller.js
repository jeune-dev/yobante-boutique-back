/**
 * Panier Controller (Client)
 * Gère le shopping cart utilisateur
 */
const PanierService = require('../../services/client/panier.service');
const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const { BadRequestError, NotFoundError } = require('../../errors/AppError');

/**
 * GET /api/panier (protégé)
 * Récupérer le panier de l'utilisateur avec calculs
 */
exports.getPanier = asyncHandler(async (req, res) => {
  const result = await PanierService.getPanier(req.user.id);
  return ok(
    res,
    {
      items: result.items,
      sousTotal: result.sousTotal,
      fraisLivraison: result.fraisLivraison,
      total: result.total,
    },
    'Panier récupéré'
  );
});

/**
 * POST /api/panier (protégé)
 * Ajouter un produit au panier
 */
exports.ajouter = asyncHandler(async (req, res) => {
  const { produitId, quantite } = req.body;
  const result = await PanierService.ajouterAuPanier(req.user.id, produitId, quantite);
  if (!result.success) throw new BadRequestError(result.message);
  return ok(
    res,
    {
      items: result.items,
      sousTotal: result.sousTotal,
      fraisLivraison: result.fraisLivraison,
      total: result.total,
    },
    result.message
  );
});

/**
 * PATCH /api/panier/:produitId (protégé)
 * Modifier la quantité d'un produit
 */
exports.modifier = asyncHandler(async (req, res) => {
  const result = await PanierService.modifierQuantite(
    req.user.id,
    req.params.produitId,
    req.body.quantite
  );
  if (!result.success) throw new BadRequestError(result.message);
  return ok(
    res,
    {
      items: result.items,
      sousTotal: result.sousTotal,
      fraisLivraison: result.fraisLivraison,
      total: result.total,
    },
    result.message
  );
});

/**
 * DELETE /api/panier/:produitId (protégé)
 * Retirer un produit du panier
 */
exports.retirer = asyncHandler(async (req, res) => {
  const result = await PanierService.retirerDuPanier(req.user.id, req.params.produitId);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, {}, result.message);
});

/**
 * DELETE /api/panier (protégé)
 * Vider complètement le panier
 */
exports.vider = asyncHandler(async (req, res) => {
  const result = await PanierService.viderPanier(req.user.id);
  return ok(res, {}, result.message);
});
