const FraisLivraisonClientService = require('../../services/client/frais-livraison.service');
const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');

exports.getActifs = asyncHandler(async (req, res) => {
  const result = await FraisLivraisonClientService.getActifs();
  return ok(res, { frais: result.frais }, 'Tarifs de livraison');
});

exports.getParVille = asyncHandler(async (req, res) => {
  const result = await FraisLivraisonClientService.getParVille(req.params.ville);
  return ok(res, { frais: result.frais }, 'Tarif de livraison');
});
