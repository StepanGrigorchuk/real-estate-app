const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    price: Number,
    developer: { type: String, index: true },
    complex: { type: String, index: true },
    images: [String],
    tags: {
      type: Object,
      default: {},
    },
    // Аудит и источники
    source: { type: String, default: null }, // источник данных (сайт/файл)
    externalId: { type: String, default: null, index: true }, // внешний ID поставщика
    status: { type: String, default: 'active', enum: ['active', 'removed'] },
    lastSeenAt: { type: Date, default: null }, // последняя фиксация в инжесте
    updatedBy: { type: String, default: null }, // агент/пользователь
  },
  { timestamps: true }
);

// Составной индекс для быстрого поиска по комплексу
PropertySchema.index({ developer: 1, complex: 1 });
// Индексы по часто используемым тегам (гибко, так как tags — объект)
PropertySchema.index({ 'tags.price': 1 });
PropertySchema.index({ 'tags.area': 1 });
PropertySchema.index({ 'tags.floor': 1 });
PropertySchema.index({ 'tags.rooms': 1 });
PropertySchema.index({ 'tags.city': 1 });
PropertySchema.index({ 'tags.type': 1 });
PropertySchema.index({ 'tags.view': 1 });
PropertySchema.index({ 'tags.finishing': 1 });
PropertySchema.index({ 'tags.payment': 1 });

module.exports = mongoose.model('Property', PropertySchema);