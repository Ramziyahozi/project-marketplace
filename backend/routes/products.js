const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../utils/cloudinaryUpload');

// Endpoint pencarian & filter produk
router.get('/', productController.getProducts);
router.post('/', upload.single('image'), productController.createProduct);
router.get('/:id', productController.getProductById);
router.put('/:id', upload.single('image'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
// Tambah review ke produk
router.post('/:id/reviews', productController.addReview);

module.exports = router; 