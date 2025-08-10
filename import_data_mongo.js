const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const Property = require('./backend/models/Property');
const Developer = require('./backend/models/Developer');
const Complex = require('./backend/models/Complex');

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/real-estate-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  await importData();
});

async function importData() {
  try {
    console.log('Начинаю импорт данных...');

    const results = [];
    
    // Читаем CSV файл
    fs.createReadStream('real_estate_russian.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`Прочитано ${results.length} записей из CSV`);

        // Создаём или обновляем застройщиков и комплексы
        const developerComplexMap = new Map();

        for (const row of results) {
          const developerSlug = row.developer;
          const complexSlug = row.complex;
          
          if (!developerComplexMap.has(developerSlug)) {
            developerComplexMap.set(developerSlug, new Set());
          }
          developerComplexMap.get(developerSlug).add(complexSlug);
        }

        // Создаём застройщиков
        const developers = new Map();
        for (const [developerSlug, complexes] of developerComplexMap) {
          const developer = await Developer.findOneAndUpdate(
            { slug: developerSlug },
            {
              name: developerSlug.replace(/_/g, ' '),
              slug: developerSlug,
              description: `Застройщик ${developerSlug.replace(/_/g, ' ')}`,
              status: 'active',
              lastSeenAt: new Date(),
              updatedBy: 'import'
            },
            { upsert: true, new: true }
          );
          developers.set(developerSlug, developer);
          console.log(`Застройщик: ${developer.name}`);
        }

        // Создаём комплексы
        const complexes = new Map();
        for (const [developerSlug, complexSlugs] of developerComplexMap) {
          const developer = developers.get(developerSlug);
          
          for (const complexSlug of complexSlugs) {
            const complex = await Complex.findOneAndUpdate(
              { developerSlug, slug: complexSlug },
              {
                name: complexSlug.replace(/_/g, ' '),
                slug: complexSlug,
                developerId: developer._id,
                developerSlug: developerSlug,
                city: 'Не указан',
                deliveryDate: 'Не указан',
                totalFloors: 1,
                seaDistance: 'Не указано',
                propertyType: 'Жилая',
                constructionMaterial: 'Не указан',
                status: 'active',
                lastSeenAt: new Date(),
                updatedBy: 'import'
              },
              { upsert: true, new: true }
            );
            complexes.set(`${developerSlug}_${complexSlug}`, complex);
            console.log(`Комплекс: ${complex.name} (${developer.name})`);
          }
        }

        // Импортируем объекты недвижимости
        let importedCount = 0;
        let updatedCount = 0;

        for (const row of results) {
          const developer = developers.get(row.developer);
          const complex = complexes.get(`${row.developer}_${row.complex}`);

          if (!developer || !complex) {
            console.warn(`Пропускаю объект: не найден застройщик или комплекс для ${row.developer}/${row.complex}`);
            continue;
          }

          // Формируем теги
          const tags = {};
          if (row.price) tags.price = parseFloat(row.price);
          if (row.area) tags.area = parseFloat(row.area);
          if (row.floor) tags.floor = parseInt(row.floor);
          if (row.rooms) tags.rooms = row.rooms;
          if (row.city) tags.city = row.city;
          if (row.type) tags.type = row.type;
          if (row.view) tags.view = row.view;
          if (row.finishing) tags.finishing = row.finishing;
          if (row.payment) tags.payment = row.payment;
          if (row.delivery) tags.delivery = row.delivery;
          if (row['sea-distance']) tags['sea-distance'] = row['sea-distance'];

          // Создаём или обновляем объект
          const propertyData = {
            title: row.title || `${row.developer} ${row.complex}`,
            description: row.description || '',
            developerId: developer._id,
            developerSlug: developer.slug,
            complexId: complex._id,
            complexSlug: complex.slug,
            tags,
            images: row.images ? row.images.split(',').map(img => img.trim()) : [],
            mainImage: row.images ? row.images.split(',')[0].trim() : null,
            source: 'csv_import',
            externalId: `${row.developer}_${row.complex}_${row.price}_${row.area}`,
            lastSeenAt: new Date(),
            updatedBy: 'import',
            status: 'active'
          };

          const existingProperty = await Property.findOne({
            source: 'csv_import',
            externalId: propertyData.externalId
          });

          if (existingProperty) {
            // Обновляем существующий объект
            await Property.findByIdAndUpdate(existingProperty._id, {
              ...propertyData,
              lastSeenAt: new Date(),
              updatedBy: 'import'
            });
            updatedCount++;
          } else {
            // Создаём новый объект
            const property = new Property(propertyData);
            await property.save();
            importedCount++;
          }
        }

        console.log('Импорт завершён!');
        console.log(`Создано: ${importedCount} объектов`);
        console.log(`Обновлено: ${updatedCount} объектов`);
        console.log(`Всего застройщиков: ${developers.size}`);
        console.log(`Всего комплексов: ${complexes.size}`);

        mongoose.connection.close();
      });

  } catch (error) {
    console.error('Ошибка при импорте:', error);
    mongoose.connection.close();
  }
}