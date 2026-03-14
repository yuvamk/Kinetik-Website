const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { verifyToken } = require('../middleware/auth');
const { upload, getFileUrl } = require('../middleware/upload');

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const { featured, category, status = 'published', page = 1, limit = 12 } = req.query;
    const filter = {};
    if (featured === 'true') filter.featured = true;
    if (category && category !== 'All') filter.category = category;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [projects, total] = await Promise.all([
      Project.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Project.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: projects,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/projects/:slug
router.get('/:slug', async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/projects — protected
router.post('/', verifyToken, upload.single('coverImage'), async (req, res) => {
  try {
    const projectData = { ...req.body };
    if (req.body.techStack && typeof req.body.techStack === 'string') {
      projectData.techStack = JSON.parse(req.body.techStack);
    }

    if (req.file) {
      projectData.coverImage = getFileUrl(req, req.file.path);
    }

    const project = await Project.create(projectData);
    res.status(201).json({ success: true, message: 'Project created', data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/projects/:id — protected
router.put('/:id', verifyToken, upload.single('coverImage'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.techStack && typeof req.body.techStack === 'string') {
      updateData.techStack = JSON.parse(req.body.techStack);
    }

    if (req.file) {
      updateData.coverImage = getFileUrl(req, req.file.path);
    }

    const project = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    res.json({ success: true, message: 'Project updated', data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/projects/:id/featured — toggle featured
router.patch('/:id/featured', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    project.featured = !project.featured;
    await project.save();
    res.json({ success: true, message: 'Featured status toggled', data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/projects/:id — protected
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    res.json({ success: true, message: 'Project deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
