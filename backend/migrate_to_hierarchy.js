const mongoose = require('mongoose');
const Property = require('./models/Property');
const Developer = require('./models/Developer');
const Complex = require('./models/Complex');

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/real-estate-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function migrateToHierarchy() {
  try {
    console.log('Начинаю миграцию данных в иерархическую структуру...');

    // Получаем все существующие объекты
    const properties = await Property.find({});
    console.log(`Найдено ${properties.length} объектов для миграции`);

    // Создаём уникальные застройщики и комплексы
    const developerComplexMap = new Map();

    properties.forEach(property => {
      const developerSlug = property.developer;
      const complexSlug = property.complex;
      
      if (!developerComplexMap.has(developerSlug)) {
        developerComplexMap.set(developerSlug, new Set());
      }
      developerComplexMap.get(developerSlug).add(complexSlug);
    });

    console.log(`Найдено ${developerComplexMap.size} застройщиков`);

    // Создаём застройщиков
    const developers = [];
    for (const [developerSlug, complexes] of developerComplexMap) {
      const developer = new Developer({
        name: developerSlug.replace(/_/g, ' '),
        slug: developerSlug,
        description: `Застройщик ${developerSlug.replace(/_/g, ' ')}`,
        status: 'active',
        lastSeenAt: new Date(),
        updatedBy: 'migration'
      });
      
      const savedDeveloper = await developer.save();
      developers.push(savedDeveloper);
      console.log(`Создан застройщик: ${developer.name}`);
    }

    // Создаём комплексы
    const complexes = [];
    for (const [developerSlug, complexSlugs] of developerComplexMap) {
      const developer = developers.find(d => d.slug === developerSlug);
      
      for (const complexSlug of complexSlugs) {
        // Получаем параметры комплекса из первого объекта
        const sampleProperty = properties.find(p => 
          p.developer === developerSlug && p.complex === complexSlug
        );

        const complex = new Complex({
          name: complexSlug.replace(/_/g, ' '),
          slug: complexSlug,
          developerId: developer._id,
          developerSlug: developerSlug,
          city: sampleProperty?.tags?.city || 'Не указан',
          deliveryDate: sampleProperty?.tags?.delivery || 'Не указан',
          totalFloors: sampleProperty?.tags?.floor || 1,
          seaDistance: sampleProperty?.tags?.['sea-distance'] || 'Не указано',
          propertyType: sampleProperty?.tags?.type || 'Жилая',
          constructionMaterial: 'Не указан',
          status: 'active',
          lastSeenAt: new Date(),
          updatedBy: 'migration'
        });

        const savedComplex = await complex.save();
        complexes.push(savedComplex);
        console.log(`Создан комплекс: ${complex.name} (${developer.name})`);
      }
    }

    // Обновляем объекты недвижимости
    console.log('Обновляю объекты недвижимости...');
    let updatedCount = 0;

    for (const property of properties) {
      const developer = developers.find(d => d.slug === property.developer);
      const complex = complexes.find(c => 
        c.developerSlug === property.developer && c.slug === property.complex
      );

      if (developer && complex) {
        await Property.findByIdAndUpdate(property._id, {
          developerId: developer._id,
          developerSlug: developer.slug,
          complexId: complex._id,
          complexSlug: complex.slug,
          lastSeenAt: new Date(),
          updatedBy: 'migration'
        });
        updatedCount++;
      }
    }

    console.log(`Обновлено ${updatedCount} объектов недвижимости`);

    // Удаляем старые поля
    console.log('Удаляю старые поля...');
    await Property.updateMany({}, {
      $unset: { developer: 1, complex: 1 }
    });

    console.log('Миграция завершена успешно!');
    console.log(`Создано: ${developers.length} застройщиков, ${complexes.length} комплексов`);
    console.log(`Обновлено: ${updatedCount} объектов недвижимости`);

  } catch (error) {
    console.error('Ошибка при миграции:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Запуск миграции
migrateToHierarchy();
