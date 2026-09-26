const express = require('express');
const router = express.Router();
const { requireAuth, requireShopAccess } = require('../middleware/auth');
const {
  createOrder, myOrders, shopOrders, updateOrderStatus,
} = require('../controllers/orderController');

router.post('/', requireAuth, createOrder);
router.get('/mine', requireAuth, myOrders);
router.get('/shop/:shopId', requireAuth, requireShopAccess, shopOrders);
router.patch('/:orderId/statut', requireAuth, updateOrderStatus);

module.exports = router;
