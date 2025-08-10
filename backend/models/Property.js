const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    
    // Ссылки на родительские уровни
    developerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Developer', required: true, index: true },
    developerSlug: { type: String, required: true, index: true },
    complexId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complex', required: true, index: true },
    complexSlug: { type: String, required: true, index: true },
    
    // Параметры уровня объекта (могут отличаться)
    tags: {
      type: Object,
      default: {},
    },
    
    // Медиа
    images: [String],
    mainImage: String,
    
    // Аудит и источники
    source: { type: String, default: null }, // источник данных (сайт/файл)
    externalId: { type: String, default: null, index: true },
    lastSeenAt: { type: Date, default: Date.now },
    updatedBy: { type: String, default: 'system' },
    status: { type: String, enum: ['active', 'removed'], default: 'active' }
  },
  { timestamps: true }
);

// Индексы для быстрой фильтрации и агрегации
PropertySchema.index({ developerSlug: 1, complexSlug: 1 });
PropertySchema.index({ status: 1 });
PropertySchema.index({ 'tags.price': 1 });
PropertySchema.index({ 'tags.area': 1 });
PropertySchema.index({ 'tags.floor': 1 });
PropertySchema.index({ 'tags.rooms': 1 });
PropertySchema.index({ 'tags.city': 1 });
PropertySchema.index({ 'tags.type': 1 });
PropertySchema.index({ 'tags.view': 1 });
PropertySchema.index({ 'tags.finishing': 1 });
PropertySchema.index({ 'tags.payment': 1 });
PropertySchema.index({ source: 1, externalId: 1 }, { unique: true });

module.exports = mongoose.model('Property', PropertySchema);