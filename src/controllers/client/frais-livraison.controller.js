const FraisLivraisonClientService = require('../../services/client/frais-livraison.service');
const ApiResponse = require('../../utils/ApiResponse');

exports.getActifs = async (req, res) => {
  try {
    const result = await FraisLivraisonClientService.getActifs();
    return ApiResponse.success(200, res, 'Tarifs de livraison', { frais: result.frais });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.getParVille = async (req, res) => {
  try {
    const result = await FraisLivraisonClientService.getParVille(req.params.ville);
    return ApiResponse.success(200, res, 'Tarif de livraison', { frais: result.frais });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};
