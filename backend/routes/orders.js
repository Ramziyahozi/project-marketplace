const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// CRUD order dengan order detail
router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.put('/:id/status', orderController.updateOrderStatus);
router.put('/:id/delivery-status', orderController.updateDeliveryStatus);
router.put('/:id/cancel', orderController.cancelOrder);
router.delete('/:id', orderController.deleteOrder);
router.get('/stats/summary', orderController.getOrderStats);

module.exports = router; 