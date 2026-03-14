const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: { type: String, enum: ['visitor', 'bot'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    visitorName: { type: String, default: 'Anonymous' },
    visitorEmail: { type: String, default: '' },
    visitorPhone: { type: String, default: '' },
    visitorCompany: { type: String, default: '' },
    messages: [messageSchema],
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    startedAt: { type: Date, default: Date.now },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatSession', chatSessionSchema);
