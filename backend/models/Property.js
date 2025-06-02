const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  developer: String,
  complex: String,
  images: [String],
  tags: {
    type: Object,
    default: {},
  },
  // Добавьте другие поля по необходимости
});

module.exports = mongoose.model('Property', PropertySchema);