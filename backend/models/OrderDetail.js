const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  productImage: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  discountPrice: { type: Number },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sellerName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Auto-calculate total price
orderDetailSchema.pre('save', function(next) {
  this.totalPrice = this.quantity * (this.discountPrice || this.unitPrice);
  next();
});

module.exports = mongoose.model('OrderDetail', orderDetailSchema); 