const Product = require('../models/Product');
const mongoose = require('mongoose');

// GET /api/products?search=&minPrice=&maxPrice=&location=&category=&sellerId=&isAvailable=
exports.getProducts = async (req, res) => {
  try {
    const {
      search,
      minPrice,
      maxPrice,
      location,
      category,
      sellerId,
      isAvailable
    } = req.query;

    let filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (minPrice) {
      filter.price = { ...filter.price, $gte: Number(minPrice) };
    }
    if (maxPrice) {
      filter.price = { ...filter.price, $lte: Number(maxPrice) };
    }
    if (location) {
      filter.pickupLocation = { $regex: location, $options: 'i' };
    }
    if (category) {
      filter.category = category;
    }
    if (sellerId && mongoose.Types.ObjectId.isValid(sellerId)) {
      filter.sellerId = sellerId;
    }
    if (isAvailable === 'true') {
      filter.isAvailable = true;
      filter.stock = { $gt: 0 };
      filter.expiredDate = { $gt: new Date() };
    }


    const products = await Product.find(filter).populate('sellerId', 'name store');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE product (dengan upload foto)
exports.createProduct = async (req, res) => {
  try {
    let { name, description, price, discountPrice, originalPrice, stock, expiredDate, pickupLocation, sellerId, isAvailable, category, foodStatus, storage, suggestion, checklist, halal } = req.body;
    // Parse checklist jika string
    if (typeof checklist === 'string') {
      try { checklist = JSON.parse(checklist); } catch (e) { checklist = []; }
    }
    let imageUrl = '';
    if (req.file && req.file.path) {
      imageUrl = req.file.path;
    }
    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      originalPrice,
      stock,
      expiredDate,
      pickupLocation,
      sellerId,
      isAvailable,
      category,
      foodStatus,
      storage,
      suggestion,
      checklist,
      halal,
      imageUrl
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET product by id
exports.getProductById = async (req, res) => {
  try {
    // Perbaiki populate agar field store ikut dikirim
    const product = await Product.findById(req.params.id)
      .populate('sellerId', 'name store')
      .populate('reviews.user', 'name'); // Tambahkan populate ini
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE product (bisa update foto)
exports.updateProduct = async (req, res) => {
  try {
    let updateData = { ...req.body };
    // Parse checklist jika string
    if (typeof updateData.checklist === 'string') {
      try { updateData.checklist = JSON.parse(updateData.checklist); } catch (e) { updateData.checklist = []; }
    }
    if (req.file && req.file.path) {
      updateData.imageUrl = req.file.path;
    }
    // Pastikan field baru ikut di update
    if (req.body.foodStatus !== undefined) updateData.foodStatus = req.body.foodStatus;
    if (req.body.storage !== undefined) updateData.storage = req.body.storage;
    if (req.body.suggestion !== undefined) updateData.suggestion = req.body.suggestion;
    if (req.body.checklist !== undefined) updateData.checklist = req.body.checklist;
    if (req.body.halal !== undefined) updateData.halal = req.body.halal;
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tambah review ke produk
exports.addReview = async (req, res) => {
  try {
    const { rating, comment, userId } = req.body;
    if (!rating || !comment || !userId) {
      return res.status(400).json({ error: 'Rating, comment, dan userId wajib diisi' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    // Tambahkan review baru
    product.reviews.unshift({ user: userId, rating, comment });
    await product.save();
    // Populate nama user untuk review terbaru
    await product.populate({ path: 'reviews.user', select: 'name' });
    res.status(201).json(product.reviews[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 
