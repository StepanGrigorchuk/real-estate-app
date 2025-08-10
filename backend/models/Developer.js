const mongoose = require('mongoose');

const DeveloperSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: String,
    logo: String,
    website: String,
    phone: String,
    email: String,
    address: String,
    // Аудит
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    lastSeenAt: { type: Date, default: Date.now },
    updatedBy: { type: String, default: 'system' }
  },
  { timestamps: true }
);

// Индексы для быстрого поиска
DeveloperSchema.index({ slug: 1 });
DeveloperSchema.index({ status: 1 });

module.exports = mongoose.model('Developer', DeveloperSchema);
