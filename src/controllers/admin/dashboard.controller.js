const dashboardService = require('../../services/admin/dashboard.service');
const { success } = require('../../utils/formatResponse');

async function getStats(req, res, next) {
  try {
    const data = await dashboardService.getOverview();
    return success(res, data, 'Dashboard stats');
  } catch (err) {
    next(err);
  }
}

async function getRevenus(req, res, next) {
  try {
    const data = await dashboardService.getRevenus();
    return success(res, data, 'Revenus');
  } catch (err) {
    next(err);
  }
}

async function getProduitsPlusVendus(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 10;
    const data = await dashboardService.getProduitsPlusVendus(limit);
    return success(res, data, 'Produits les plus vendus');
  } catch (err) {
    console.error('getProduitsPlusVendus ERROR:', err.message);
    next(err);
  }
}

async function getStockAlertes(req, res, next) {
  try {
    const threshold = Number(req.query.threshold) || 5;
    const data = await dashboardService.getStockAlertes(threshold);
    return success(res, data, 'Alertes stock');
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats, getRevenus, getProduitsPlusVendus, getStockAlertes };
