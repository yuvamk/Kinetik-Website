const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Contact = require('../models/Contact');
const { verifyToken } = require('../middleware/auth');

// Email transporter
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

// GET /api/contacts — protected
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [contacts, total, newCount] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Contact.countDocuments(filter),
      Contact.countDocuments({ status: 'new' }),
    ]);

    res.json({
      success: true,
      data: contacts,
      newCount,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/contacts — public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, service, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const contact = await Contact.create({
      name, email, phone, company, service, message,
      ipAddress: req.ip,
      source: 'contact_form',
    });

    // Emit real-time notification
    if (req.io) {
      req.io.to('admin_room').emit('new_inquiry', {
        _id: contact._id,
        name: contact.name,
        email: contact.email,
        service: contact.service,
        createdAt: contact.createdAt,
      });
    }

    // Send email notification
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"Kinetik Website" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `New Inquiry from ${name} — ${service || 'General'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #6C63FF;">New Contact Inquiry</h2>
            <table style="width:100%; border-collapse:collapse;">
              <tr><td style="padding:8px; font-weight:bold;">Name:</td><td style="padding:8px;">${name}</td></tr>
              <tr><td style="padding:8px; font-weight:bold;">Email:</td><td style="padding:8px;">${email}</td></tr>
              <tr><td style="padding:8px; font-weight:bold;">Phone:</td><td style="padding:8px;">${phone || 'N/A'}</td></tr>
              <tr><td style="padding:8px; font-weight:bold;">Company:</td><td style="padding:8px;">${company || 'N/A'}</td></tr>
              <tr><td style="padding:8px; font-weight:bold;">Service:</td><td style="padding:8px;">${service || 'N/A'}</td></tr>
              <tr><td style="padding:8px; font-weight:bold;">Message:</td><td style="padding:8px;">${message}</td></tr>
            </table>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('Email send error:', emailErr.message);
    }

    res.status(201).json({ success: true, message: 'Thank you! We will get back to you shortly.', data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/contacts/:id — update status
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found.' });
    res.json({ success: true, message: 'Status updated', data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/contacts/:id — protected
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found.' });
    res.json({ success: true, message: 'Contact deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/contacts/stats — admin dashboard stats
router.get('/stats/overview', verifyToken, async (req, res) => {
  try {
    const Contact = require('../models/Contact');
    const Project = require('../models/Project');
    const Blog = require('../models/Blog');
    const Partner = require('../models/Partner');

    const [totalProjects, totalBlogs, totalPartners, totalContacts, newContacts] = await Promise.all([
      Project.countDocuments(),
      Blog.countDocuments(),
      Partner.countDocuments(),
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'new' }),
    ]);

    // Monthly inquiries for chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Contact.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const serviceData = await Contact.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: { totalProjects, totalBlogs, totalPartners, totalContacts, newContacts, monthlyData, serviceData },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
