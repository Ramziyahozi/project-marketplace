const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  phone: { type: String },
  address: { type: String },
  role: { type: String, enum: ['penjual', 'pembeli'], required: false },
  store: {
    name: String,
    address: String,
    category: String, // kategori toko/penjual
    phone: String,    // nomor HP toko
    // Tambahkan field lain jika perlu
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  profileImage: { type: String }, // URL Cloudinary
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  category: { type: String }, // kategori toko/penjual, opsional
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema); 