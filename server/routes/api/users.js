// server/routes/api/users.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../../middlewares/auth');
const adminCredentials = require('../../adminCredentials'); // Import admin credentials
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error('❌ JWT_SECRET is missing in environment variables');
  process.exit(1); // Immediately crash with clear reason
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const isAdmin = adminCredentials.some(admin => admin.email === email && admin.password === password);

    if (isAdmin) {
      const payload = { email, role: 'admin' };
      const token = jwt.sign(payload, jwtSecret, { expiresIn: '30m' });

      res.cookie('token', token, { httpOnly: true });
      return res.json({ email, role: 'admin' });
    } else {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.send('Logged out successfully');
});

router.get('/auth', authMiddleware, async (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return res.json({ email: req.user.email, role: 'admin' });
    }
    res.status(403).json({ msg: 'Unauthorized' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
