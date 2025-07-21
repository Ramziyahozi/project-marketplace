const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../utils/cloudinaryUpload');
const User = require('../models/User'); // Added import for User model

// CRUD user
router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

router.post('/upload-profile-image', upload.single('image'), (req, res) => {
  if (!req.file || !req.file.path) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: req.file.path });
});

// LOGIN tanpa hash
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Email tidak ditemukan' });
    if (user.password !== password) return res.status(401).json({ error: 'Password salah' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 