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
  for (const property of data) {
    if (!property.price && property.tags && property.tags.price) {
      property.price = property.tags.price;
    }
    await Property.create(property);
  }
  console.log('Импорт завершён');
  mongoose.disconnect();
}

importData();