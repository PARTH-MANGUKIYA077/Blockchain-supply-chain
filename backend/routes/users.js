const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  organization: user.organization,
  address: user.address,
  createdAt: user.createdAt
});

router.get('/', protect, authorize('ADMIN'), async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  return res.json({ success: true, count: users.length, data: users });
});

router.get('/:id', protect, async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (req.user.role !== 'ADMIN' && req.user._id.toString() !== user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not allowed to view this profile.' });
  }

  return res.json({ success: true, data: sanitizeUser(user) });
});

router.put('/:id', protect, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (req.user.role !== 'ADMIN' && req.user._id.toString() !== user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not allowed to update this profile.' });
  }

  const allowed = ['name', 'phone', 'organization', 'address'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });

  if (req.user.role === 'ADMIN' && req.body.role) {
    user.role = req.body.role;
  }

  await user.save();
  return res.json({ success: true, data: sanitizeUser(user) });
});

router.delete('/:id', protect, authorize('ADMIN'), async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  return res.json({ success: true, message: 'User deleted successfully.' });
});

module.exports = router;
