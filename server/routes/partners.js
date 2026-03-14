const express = require('express');
const router = express.Router();
const Partner = require('../models/Partner');
const { verifyToken } = require('../middleware/auth');
const { upload, getFileUrl } = require('../middleware/upload');

// GET /api/partners
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { active: true };
    if (category) filter.category = category;
    const partners = await Partner.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: partners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/partners — protected
router.post('/', verifyToken, upload.single('logo'), async (req, res) => {
  try {
    const partnerData = { ...req.body };
    if (!req.file) return res.status(400).json({ success: false, message: 'Logo image is required.' });

    partnerData.logo = getFileUrl(req, req.file.path);

    const partner = await Partner.create(partnerData);
    res.status(201).json({ success: true, message: 'Partner added', data: partner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/partners/:id — protected
router.put('/:id', verifyToken, upload.single('logo'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.logo = getFileUrl(req, req.file.path);
    }
    const partner = await Partner.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found.' });
    res.json({ success: true, message: 'Partner updated', data: partner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/partners/:id — protected
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found.' });
    res.json({ success: true, message: 'Partner deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
