const express = require('express');
const router = express.Router();
const orderDetailController = require('../controllers/orderDetailController');

// CRUD order details
router.get('/', orderDetailController.getOrderDetails);
router.get('/:id', orderDetailController.getOrderDetail);
router.get('/order/:orderId', orderDetailController.getOrderDetailsByOrderId);
router.put('/:id', orderDetailController.updateOrderDetail);
router.delete('/:id', orderDetailController.deleteOrderDetail);

module.exports = router; 