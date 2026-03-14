const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: {
      type: String,
      enum: ['Web', 'Mobile', 'AI', 'Design', 'Other'],
      default: 'Web',
    },
    description: { type: String, required: true },
    fullDescription: { type: String },
    coverImage: { type: String },
    images: [{ type: String }],
    techStack: [{ type: String }],
    clientName: { type: String },
    projectUrl: { type: String },
    githubUrl: { type: String },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate unique slug
projectSchema.pre('save', async function (next) {
  if (!this.isModified('title') && this.slug) return next();
  let slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  let exists = await mongoose.models.Project.findOne({ slug, _id: { $ne: this._id } });
  let counter = 2;
  while (exists) {
    slug = `${slug}-${counter}`;
    exists = await mongoose.models.Project.findOne({ slug, _id: { $ne: this._id } });
    counter++;
  }
  this.slug = slug;
  next();
});

module.exports = mongoose.model('Project', projectSchema);
