const orderService = require('../../services/admin/order.service');
const { success, error } = require('../../utils/response');

const getAllOrders = async (req, res) => {
  try {
    const result = await orderService.getAllOrders(req.query);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    return success(res, order);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.statut);
    return success(res, order, 'Statut de commande mis à jour');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { getAllOrders, getOrderById, updateOrderStatus };
