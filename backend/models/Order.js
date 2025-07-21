const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  status: { type: String, enum: ['on_delivery', 'delivered', 'failed'], required: true },
  time: { type: Date, default: Date.now }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantity: { type: Number, required: true },
  deliveryMethod: { type: String },
  pickupTime: { type: String },
  deliveryAddress: { type: String },
  deliveryFee: { type: Number },
  deliveryStatus: { type: String, enum: ['pending', 'on_delivery', 'delivered', 'failed'], default: 'pending' },
  tracking: { type: [trackingSchema], default: [] },
  status: { type: String, enum: ['pending', 'processing_payment', 'pending_admin_confirmation', 'picked_up', 'cancelled', 'expired'], default: 'pending' },
  notes: { type: String },
  paymentMethod: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema); 