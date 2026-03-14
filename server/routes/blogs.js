const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { verifyToken } = require('../middleware/auth');
const { upload, getFileUrl } = require('../middleware/upload');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// GET /api/blogs
router.get('/', async (req, res) => {
  try {
    const { category, search, status = 'published', page = 1, limit = 9 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category && category !== 'All') filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [blogs, total] = await Promise.all([
      Blog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Blog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: blogs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/blogs/:slug
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!blog) return res.status(404).json({ success: false, message: 'Blog post not found.' });
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/blogs — protected
router.post('/', verifyToken, upload.single('coverImage'), async (req, res) => {
  try {
    const blogData = { ...req.body };
    if (req.body.tags && typeof req.body.tags === 'string') {
      blogData.tags = JSON.parse(req.body.tags);
    }

    if (req.file) {
      blogData.coverImage = getFileUrl(req, req.file.path);
    }

    const blog = await Blog.create(blogData);
    res.status(201).json({ success: true, message: 'Blog created', data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/blogs/generate — AI content generation
router.post('/generate', verifyToken, async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ success: false, message: 'Topic is required.' });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Write a professional, SEO-friendly blog post about: "${topic}".

    Requirements:
    - Write a compelling title
    - Include an introduction paragraph
    - Include 3 main sections with H2 headings
    - Include bullet points where appropriate
    - Write a conclusion
    - Return the response as valid JSON in this exact format:
    {
      "title": "Blog post title here",
      "content": "<html content here with proper h2, p, ul, li tags>",
      "excerpt": "First 160 characters of the post",
      "suggestedTags": ["tag1", "tag2", "tag3", "tag4"],
      "category": "Technology|Design|AI|Business|Development|Strategy"
    }

    Make the content professional, informative, and engaging. Use proper HTML tags for formatting.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ success: false, message: 'Failed to parse AI response.' });
    }

    const generated = JSON.parse(jsonMatch[0]);
    res.json({ success: true, data: generated });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ success: false, message: 'AI generation failed: ' + error.message });
  }
});

// PUT /api/blogs/:id — protected
router.put('/:id', verifyToken, upload.single('coverImage'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.tags && typeof req.body.tags === 'string') {
      updateData.tags = JSON.parse(req.body.tags);
    }

    if (req.file) {
      updateData.coverImage = getFileUrl(req, req.file.path);
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });
    res.json({ success: true, message: 'Blog updated', data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/blogs/:id — protected
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });
    res.json({ success: true, message: 'Blog deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
