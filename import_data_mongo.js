const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Property = require('./backend/models/Property');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'data.json'), 'utf-8'));

mongoose.connect('mongodb://localhost:27017/realestate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function importData() {
  for (const raw of data) {
    const property = { ...raw };
    if (!property.price && property.tags && property.tags.price) {
      property.price = property.tags.price;
    }
    // Проставляем аудит-поля по умолчанию
    property.source = property.source || 'seed-file';
    property.externalId = property.externalId || property.id || null;
    property.lastSeenAt = new Date();
    property.updatedBy = 'seed-import';
    property.status = property.status || 'active';

    // Идемпотентный upsert по (source, externalId)
    await Property.findOneAndUpdate(
      { source: property.source, externalId: property.externalId },
      { $set: property },
      { upsert: true, new: true }
    );
  }
  console.log('Импорт завершён');
  mongoose.disconnect();
}

importData();