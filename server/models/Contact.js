const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String },
    company: { type: String },
    service: {
      type: String,
      enum: [
        'Web Development',
        'Mobile App Development',
        'UI/UX Design',
        'AI Integration',
        'Digital Strategy',
        'Business Consulting',
        'Other',
      ],
    },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'read', 'replied', 'closed'], default: 'new' },
    source: { type: String, enum: ['contact_form', 'chat', 'footer_form'], default: 'contact_form' },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

// Indexes
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);
