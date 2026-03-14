const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: {
      type: String,
      enum: ['Technology', 'Design', 'AI', 'Business', 'Development', 'Strategy'],
      default: 'Technology',
    },
    tags: [{ type: String }],
    coverImage: { type: String },
    content: { type: String, required: true },
    excerpt: { type: String },
    author: { type: String, default: 'Kinetik Team' },
    aiGenerated: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    views: { type: Number, default: 0 },
    readTime: { type: Number, default: 5 },
  },
  { timestamps: true }
);

// Auto-generate excerpt from content
blogSchema.pre('save', async function (next) {
  if (this.isModified('content') && !this.excerpt) {
    const plainText = this.content.replace(/<[^>]+>/g, '');
    this.excerpt = plainText.substring(0, 160).trim() + '...';
  }

  // Auto-generate unique slug
  if (this.isModified('title') || !this.slug) {
    let slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    let exists = await mongoose.models.Blog.findOne({ slug, _id: { $ne: this._id } });
    let counter = 2;
    while (exists) {
      slug = `${slug}-${counter}`;
      exists = await mongoose.models.Blog.findOne({ slug, _id: { $ne: this._id } });
      counter++;
    }
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
