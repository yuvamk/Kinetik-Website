const express = require('express');
const router = express.Router();
const ChatSession = require('../models/ChatSession');
const { verifyToken } = require('../middleware/auth');

// GET /api/chat/sessions — admin: list all sessions
router.get('/sessions', verifyToken, async (req, res) => {
  try {
    const sessions = await ChatSession.find()
      .sort({ lastMessageAt: -1 })
      .select('sessionId visitorName visitorEmail visitorPhone visitorCompany status startedAt lastMessageAt messages');
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/chat/sessions/:sessionId — admin: get full session
router.get('/sessions/:sessionId', verifyToken, async (req, res) => {
  try {
    const session = await ChatSession.findOne({ sessionId: req.params.sessionId });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/chat/sessions/:sessionId — admin: delete a session
router.delete('/sessions/:sessionId', verifyToken, async (req, res) => {
  try {
    await ChatSession.findOneAndDelete({ sessionId: req.params.sessionId });
    res.json({ success: true, message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/chat/message — visitor sends a message, Gemini replies
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message, visitorName, visitorEmail, visitorPhone, visitorCompany } = req.body;
    if (!sessionId || !message) {
      return res.status(400).json({ success: false, message: 'sessionId and message are required' });
    }

    // Find or create session
    let session = await ChatSession.findOne({ sessionId });
    if (!session) {
      session = await ChatSession.create({
        sessionId,
        visitorName: visitorName || 'Visitor',
        visitorEmail: visitorEmail || '',
        visitorPhone: visitorPhone || '',
        visitorCompany: visitorCompany || '',
        messages: [],
      });
    } else {
      // Update visitor details if provided
      if (visitorName) session.visitorName = visitorName;
      if (visitorEmail) session.visitorEmail = visitorEmail;
      if (visitorPhone) session.visitorPhone = visitorPhone;
      if (visitorCompany) session.visitorCompany = visitorCompany;
    }

    // Add visitor message
    session.messages.push({ from: 'visitor', message });
    session.lastMessageAt = new Date();

    // Generate Gemini reply
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const conversationHistory = session.messages.map(m =>
      `${m.from === 'visitor' ? 'Client' : 'Kinetik AI'}: ${m.message}`
    ).join('\n');

    const systemPrompt = `You are Kinetik AI, the intelligent assistant for Kinetik — a premium digital agency that builds stunning websites, mobile apps, branding, SEO solutions, and AI integrations for businesses.

Your goal is to:
1. Warmly greet new visitors
2. Understand their business needs and goals
3. Naturally collect their contact details (name, email, phone, company) during the conversation — do NOT ask all at once, weave it in naturally
4. Answer questions about Kinetik's services confidently
5. Encourage them to book a free consultation

Kinetik Services:
- Custom Website & Web App Development
- Mobile App Development (iOS & Android)
- Brand Identity & UI/UX Design
- SEO & Digital Marketing
- AI Integration & Automation
- E-commerce Solutions

Be warm, professional, concise, and persuasive. Use emojis sparingly for personality. Never sound like a bot. Always guide the conversation toward learning about their project.

Current visitor info:
- Name: ${session.visitorName || 'Unknown'}
- Email: ${session.visitorEmail || 'Not provided'}
- Phone: ${session.visitorPhone || 'Not provided'}
- Company: ${session.visitorCompany || 'Not provided'}

Conversation so far:
${conversationHistory}

Now respond to the last client message naturally and helpfully:`;

    const result = await model.generateContent(systemPrompt);
    const botReply = result.response.text().trim();

    // Add bot reply to session
    session.messages.push({ from: 'bot', message: botReply });
    await session.save();

    res.json({
      success: true,
      data: {
        reply: botReply,
        sessionId,
        visitorName: session.visitorName,
      },
    });
  } catch (err) {
    console.error('Chat message error:', err);
    res.status(500).json({ success: false, message: 'Failed to process message' });
  }
});

module.exports = router;
