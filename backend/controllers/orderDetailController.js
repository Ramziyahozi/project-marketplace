const OrderDetail = require('../models/OrderDetail');
const Order = require('../models/Order');

// GET all order details
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.query;
    let filter = {};
    
    if (orderId) {
      filter.orderId = orderId;
    }

    const orderDetails = await OrderDetail.find(filter)
      .populate('orderId', 'status createdAt')
      .populate('productId', 'name imageUrl')
      .populate('sellerId', 'name')
      .sort({ createdAt: -1 });

    res.json(orderDetails);
  } catch (err) {
    console.error('Get order details error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET single order detail
exports.getOrderDetail = async (req, res) => {
  try {
    const orderDetail = await OrderDetail.findById(req.params.id)
      .populate('orderId', 'status createdAt')
      .populate('productId', 'name imageUrl')
      .populate('sellerId', 'name');

    if (!orderDetail) {
      return res.status(404).json({ error: 'Order detail tidak ditemukan' });
    }

    res.json(orderDetail);
  } catch (err) {
    console.error('Get order detail error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET order details by order ID
exports.getOrderDetailsByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const orderDetails = await OrderDetail.find({ orderId })
      .populate('productId', 'name imageUrl category')
      .populate('sellerId', 'name');

    res.json(orderDetails);
  } catch (err) {
    console.error('Get order details by order ID error:', err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE order detail
exports.updateOrderDetail = async (req, res) => {
  try {
    const { quantity, unitPrice } = req.body;
    
    const orderDetail = await OrderDetail.findByIdAndUpdate(
      req.params.id,
      { quantity, unitPrice },
      { new: true }
    ).populate('orderId', 'status createdAt')
     .populate('productId', 'name imageUrl')
     .populate('sellerId', 'name');

    if (!orderDetail) {
      return res.status(404).json({ error: 'Order detail tidak ditemukan' });
    }

    res.json(orderDetail);
  } catch (err) {
    console.error('Update order detail error:', err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE order detail
exports.deleteOrderDetail = async (req, res) => {
  try {
    const orderDetail = await OrderDetail.findByIdAndDelete(req.params.id);
    
    if (!orderDetail) {
      return res.status(404).json({ error: 'Order detail tidak ditemukan' });
    }

    res.json({ message: 'Order detail berhasil dihapus' });
  } catch (err) {
    console.error('Delete order detail error:', err);
    res.status(400).json({ error: err.message });
  }
}; 