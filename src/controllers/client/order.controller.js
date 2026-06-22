const orderService = require('../../services/client/order.service');
const { success, created, error } = require('../../utils/response');

const createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.user.id, req.body);
    return created(res, order, 'Commande passée avec succès');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getMyOrders = async (req, res) => {
  try {
    const result = await orderService.getMyOrders(req.user.id, req.query);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getMyOrderById = async (req, res) => {
  try {
    const order = await orderService.getMyOrderById(req.user.id, req.params.id);
    return success(res, order);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await orderService.cancelOrder(req.user.id, req.params.id);
    return success(res, order, 'Commande annulée');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { createOrder, getMyOrders, getMyOrderById, cancelOrder };
