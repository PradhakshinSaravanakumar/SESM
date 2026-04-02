const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register user
router.post('/register', async (req, res) => {
  try {
    const { username, email, phone, password, role } = req.body;
    const user = new User({ username, email, phone, password, role });
    await user.save();
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'your_jwt_secret');
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send({ error: 'Registration failed', message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid login credentials');
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'your_jwt_secret');
    res.send({ user, token });
  } catch (error) {
    res.status(400).send({ error: 'Login failed', message: error.message });
  }
});

module.exports = router;