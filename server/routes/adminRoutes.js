const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// Example admin-only route
router.get('/data', auth, authorize('admin'), (req, res) => {
  res.send({ message: 'This is a protected admin route' });
});

// Get all users
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send({ error: 'Failed to get users' });
  }
});

// Update a user
router.put('/users/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send(user);
  } catch (error) {
    res.status(400).send({ error: 'Failed to update user' });
  }
});

// Delete a user
router.delete('/users/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to delete user' });
  }
});

// Get online users
router.get('/online-users', auth, authorize('admin'), async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineUsers = await User.find({ lastSeen: { $gte: fiveMinutesAgo } });
    res.send(onlineUsers);
  } catch (error) {
    res.status(500).send({ error: 'Failed to get online users' });
  }
});

module.exports = router;