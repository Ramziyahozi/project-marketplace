const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String }, // URL Cloudinary
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  originalPrice: { type: Number },
  stock: { type: Number, default: 1 },
  expiredDate: { type: Date, required: true },
  pickupLocation: { type: String }, // alamat/lokasi Google Maps
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  category: { type: String }, // kategori makanan, misal: 'nasi', 'roti', 'minuman', dll
  foodStatus: { type: String },
  storage: { type: String },
  suggestion: { type: String },
  checklist: [{ type: String }],
  halal: { type: String },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      rating: { type: Number, required: true },
      comment: { type: String, required: true },
      date: { type: Date, default: Date.now }
    }
  ]
});

productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema); 