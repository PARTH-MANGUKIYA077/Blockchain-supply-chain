const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { signToken } = require('../utils/auth');
const { protect } = require('../middleware/auth');

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

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, organization, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ success: false, message: 'User already exists with this email.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'CUSTOMER',
      phone,
      organization,
      address
    });

    const token = signToken(user);
    return res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user);
    return res.json({
      success: true,
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Login failed.' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'User logged out successfully.' });
});

router.get('/me', protect, async (req, res) => {
  return res.json({ success: true, user: sanitizeUser(req.user) });
});

module.exports = router;
