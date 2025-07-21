const User = require('../models/User');

// GET /api/sellers?search=&location=&category=
exports.getSellers = async (req, res) => {
  try {
    const { search, location, category } = req.query;
    let filter = { role: 'penjual' };
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (location) {
      filter.address = { $regex: location, $options: 'i' };
    }
    if (category) {
      filter.category = category;
    }
    const sellers = await User.find(filter).select('-__v -createdAt -updatedAt -email');
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE user
exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET all users (atau filter by email)
exports.getUsers = async (req, res) => {
  try {
    const { email } = req.query;
    let filter = {};
    if (email) filter.email = email;
    const users = await User.find(filter);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET user by id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update field user
    Object.assign(user, req.body);

    // Jika ada field store, merge dengan data lama
    if (req.body.store) {
      user.store = { ...user.store, ...req.body.store };
    }

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 