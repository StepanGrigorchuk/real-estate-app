const mongoose = require('mongoose');

const ComplexSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, index: true },
    developerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Developer', required: true, index: true },
    developerSlug: { type: String, required: true, index: true },
    
    // Параметры уровня комплекса (одинаковые для всех объектов)
    city: { type: String, index: true },
    district: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    
    // Характеристики комплекса
    totalFloors: Number, // этажность
    seaDistance: String, // расстояние до моря
    deliveryDate: String, // срок сдачи
    propertyType: String, // тип недвижимости (жилая, коммерческая)
    constructionMaterial: String, // материал строительства
    
    // Медиа
    images: [String],
    mainImage: String,
    
    // Аудит
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    lastSeenAt: { type: Date, default: Date.now },
    updatedBy: { type: String, default: 'system' }
  },
  { timestamps: true }
);

// Составной индекс для быстрого поиска по developer + complex
ComplexSchema.index({ developerSlug: 1, slug: 1 }, { unique: true });
ComplexSchema.index({ status: 1 });
ComplexSchema.index({ city: 1 });
ComplexSchema.index({ deliveryDate: 1 });

module.exports = mongoose.model('Complex', ComplexSchema);
