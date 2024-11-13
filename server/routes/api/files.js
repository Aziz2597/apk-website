// routes/api/files.js
const express = require('express');
const router = express.Router();
const File = require('../../models/Upload');

// @route   GET api/files
// @desc    Get all uploaded files
// @access  Public
router.get('/', async (req, res) => {
  try {
    const files = await File.find();
    res.json(files);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
