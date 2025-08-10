const express = require('express');
const Developer = require('../models/Developer');
const Complex = require('../models/Complex');
const Property = require('../models/Property');

const router = express.Router();

// Получить всех застройщиков с базовой статистикой
router.get('/', async (req, res) => {
  try {
    const developers = await Developer.find({ status: 'active' })
      .select('name slug description logo')
      .sort('name');

    // Добавляем статистику по каждому застройщику
    const developersWithStats = await Promise.all(
      developers.map(async (developer) => {
        const complexCount = await Complex.countDocuments({
          developerId: developer._id,
          status: 'active'
        });

        const propertyCount = await Property.countDocuments({
          developerSlug: developer.slug,
          status: 'active'
        });

        return {
          ...developer.toObject(),
          stats: {
            complexes: complexCount,
            properties: propertyCount
          }
        };
      })
    );

    res.json(developersWithStats);
  } catch (err) {
    console.error('Ошибка в /api/developers:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Получить застройщика по slug с детальной информацией
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const developer = await Developer.findOne({ 
      slug, 
      status: 'active' 
    });

    if (!developer) {
      return res.status(404).json({ error: 'Застройщик не найден' });
    }

    // Получаем комплексы застройщика
    const complexes = await Complex.find({
      developerId: developer._id,
      status: 'active'
    }).select('name slug city deliveryDate totalFloors seaDistance mainImage');

    // Агрегируем статистику по объектам
    const propertyStats = await Property.aggregate([
      {
        $match: {
          developerSlug: slug,
          status: 'active'
        }
      },
      {
        $group: {
          _id: null,
          totalProperties: { $sum: 1 },
          priceMin: { $min: '$tags.price' },
          priceMax: { $max: '$tags.price' },
          areaMin: { $min: '$tags.area' },
          areaMax: { $max: '$tags.area' },
          floorMin: { $min: '$tags.floor' },
          floorMax: { $max: '$tags.floor' },
          uniqueRooms: { $addToSet: '$tags.rooms' },
          uniqueTypes: { $addToSet: '$tags.type' },
          uniqueViews: { $addToSet: '$tags.view' },
          uniqueFinishes: { $addToSet: '$tags.finishing' },
          uniquePayments: { $addToSet: '$tags.payment' }
        }
      }
    ]);

    const result = {
      ...developer.toObject(),
      complexes,
      propertyStats: propertyStats[0] || {}
    };

    res.json(result);
  } catch (err) {
    console.error('Ошибка в /api/developers/:slug:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;
