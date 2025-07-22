const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');

// CREATE order 
exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let order, orderDetail, product;
  try {
    const { buyerId, productId, quantity, deliveryMethod, pickupTime, deliveryAddress, deliveryFee, notes, paymentMethod } = req.body;

    
    product = await Product.findById(productId).populate('sellerId', 'name').session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }

    if (product.stock < quantity) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        error: `Stok tidak mencukupi. Stok tersedia: ${product.stock}, yang diminta: ${quantity}` 
      });
    }


    product.stock -= quantity;
    await product.save({ session });


    order = new Order({
      buyerId,
      productId,
      sellerId: product.sellerId._id,
      quantity,
      deliveryMethod,
      pickupTime,
      deliveryAddress,
      deliveryFee,
      notes,
      paymentMethod,
      status: 'pending'
    });
    await order.save({ session });


    orderDetail = new OrderDetail({
      orderId: order._id,
      productId: product._id,
      productName: product.name,
      productImage: product.imageUrl,
      quantity: quantity,
      unitPrice: product.price,
      totalPrice: quantity * (product.discountPrice || product.price),
      discountPrice: product.discountPrice,
      sellerId: product.sellerId._id,
      sellerName: product.sellerId.name
    });
    await orderDetail.save({ session });


    await session.commitTransaction();
    session.endSession();


    res.status(201).json({
      _id: order._id,
      buyerId: order.buyerId,
      productId: order.productId,
      quantity: order.quantity,
      status: order.status,
      orderDetail: {
        _id: orderDetail._id,
        productName: orderDetail.productName,
        quantity: orderDetail.quantity,
        totalPrice: orderDetail.totalPrice
      },
      message: 'Order berhasil dibuat dan stok telah dikurangi'
    });

  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Gagal membuat order. Silakan coba lagi.' });
  }
};

// GET orders
exports.getOrders = async (req, res) => {
  try {
    const { buyerId, sellerId, status, deliveryMethod } = req.query;
    let filter = {};

    if (buyerId) filter.buyerId = buyerId;
    if (sellerId) filter.sellerId = sellerId;
    if (status) filter.status = status;
    if (deliveryMethod) filter.deliveryMethod = deliveryMethod;

    const orders = await Order.find(filter)
      .populate('buyerId', 'name email phone')
      .populate('productId', 'name price discountPrice imageUrl')
      .populate('sellerId', 'name')
      .sort({ createdAt: -1 });


    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const orderDetails = await OrderDetail.find({ orderId: order._id });
        return {
          ...order.toObject(),
          orderDetails
        };
      })
    );

    res.json(ordersWithDetails);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: err.message });
  }
};


exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyerId', 'name email phone')
      .populate('productId', 'name price discountPrice imageUrl')
      .populate('sellerId', 'name');

    if (!order) {
      return res.status(404).json({ error: 'Order tidak ditemukan' });
    }

    const orderDetails = await OrderDetail.find({ orderId: order._id });

    res.json({
      order,
      orderDetails
    });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatus = ['pending', 'picked_up', 'cancelled', 'expired'];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid' });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('buyerId', 'name email phone')
     .populate('productId', 'name price discountPrice imageUrl')
     .populate('sellerId', 'name');

    if (!order) {
      return res.status(404).json({ error: 'Order tidak ditemukan' });
    }

    res.json(order);
  } catch (err) {
    console.error('Update order error:', err);
    res.status(400).json({ error: err.message });
  }
};


exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryStatus } = req.body;
    const allowedStatus = ['pending', 'on_delivery', 'delivered', 'failed'];
    if (!allowedStatus.includes(deliveryStatus)) {
      return res.status(400).json({ error: 'Delivery status tidak valid' });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { deliveryStatus },
      { new: true }
    ).populate('buyerId', 'name email phone')
     .populate('productId', 'name price discountPrice imageUrl')
     .populate('sellerId', 'name');

    if (!order) {
      return res.status(404).json({ error: 'Order tidak ditemukan' });
    }

    res.json(order);
  } catch (err) {
    console.error('Update delivery status error:', err);
    res.status(400).json({ error: err.message });
  }
};

//Cacel Order
exports.cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Order tidak ditemukan' });
    }


    if (!['pending', 'processing_payment'].includes(order.status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Order tidak dapat dibatalkan' });
    }


    const product = await Product.findById(order.productId).session(session);
    if (product) {
      product.stock += order.quantity;
      await product.save({ session });
    }

    // Update status order
    order.status = 'cancelled';
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ 
      message: 'Order berhasil dibatalkan dan stok telah dikembalikan',
      orderId: order._id,
      status: order.status
    });

  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error('Cancel order error:', err);
    res.status(500).json({ error: 'Gagal membatalkan order. Silakan coba lagi.' });
  }
};


exports.getOrderStats = async (req, res) => {
  try {
    const { sellerId } = req.query;
    let filter = {};
    if (sellerId) filter.sellerId = sellerId;

    const stats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: { $multiply: ['$quantity', '$price'] } }
        }
      }
    ]);

    res.json(stats);
  } catch (err) {
    console.error('Get order stats error:', err);
    res.status(500).json({ error: err.message });
  }
}; 

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order tidak ditemukan' });
    res.json({ message: 'Order berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 
