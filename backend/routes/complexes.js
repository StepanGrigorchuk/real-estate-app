const express = require('express');
const Complex = require('../models/Complex');
const Property = require('../models/Property');
const Developer = require('../models/Developer');

const router = express.Router();

// Получить все комплексы с агрегированной статистикой
router.get('/', async (req, res) => {
  try {
    const {
      developer,
      city,
      deliveryDate,
      priceMin,
      priceMax,
      areaMin,
      areaMax,
      rooms,
      type,
      view,
      finishing,
      payment,
      sort = 'name',
      limit = 20,
      skip = 0,
    } = req.query;

    // Формируем фильтр для комплексов
    const complexFilter = { status: 'active' };
    if (developer) complexFilter.developerSlug = developer;
    if (city) complexFilter.city = city;
    if (deliveryDate) complexFilter.deliveryDate = deliveryDate;

    // Получаем комплексы
    const complexes = await Complex.find(complexFilter)
      .populate('developerId', 'name slug')
      .sort(sort === 'name' ? 'name' : sort === 'delivery' ? 'deliveryDate' : 'name')
      .skip(Number(skip))
      .limit(Number(limit));

    // Агрегируем статистику по объектам для каждого комплекса
    const complexesWithStats = await Promise.all(
      complexes.map(async (complex) => {
        // Формируем фильтр для объектов с учётом фильтров пользователя
        const propertyFilter = {
          complexId: complex._id,
          status: 'active'
        };

        // Применяем фильтры по объектам
        if (priceMin !== undefined || priceMax !== undefined) {
          const priceFilter = {};
          if (priceMin !== undefined && priceMin !== '') priceFilter.$gte = Number(priceMin);
          if (priceMax !== undefined && priceMax !== '') priceFilter.$lte = Number(priceMax);
          if (Object.keys(priceFilter).length) propertyFilter['tags.price'] = priceFilter;
        }

        if (areaMin !== undefined || areaMax !== undefined) {
          const areaFilter = {};
          if (areaMin !== undefined && areaMin !== '') areaFilter.$gte = Number(areaMin);
          if (areaMax !== undefined && areaMax !== '') areaFilter.$lte = Number(areaMax);
          if (Object.keys(areaFilter).length) propertyFilter['tags.area'] = areaFilter;
        }

        if (rooms) {
          const roomsArray = Array.isArray(rooms) ? rooms : [rooms];
          propertyFilter['tags.rooms'] = { $in: roomsArray.filter(r => r !== '') };
        }

        if (type) {
          const typeArray = Array.isArray(type) ? type : [type];
          propertyFilter['tags.type'] = { $in: typeArray.filter(t => t !== '') };
        }

        if (view) {
          const viewArray = Array.isArray(view) ? view : [view];
          propertyFilter['tags.view'] = { $in: viewArray.filter(v => v !== '') };
        }

        if (finishing) {
          const finishingArray = Array.isArray(finishing) ? finishing : [finishing];
          propertyFilter['tags.finishing'] = { $in: finishingArray.filter(f => f !== '') };
        }

        if (payment) {
          const paymentArray = Array.isArray(payment) ? payment : [payment];
          propertyFilter['tags.payment'] = { $in: paymentArray.filter(p => p !== '') };
        }

        // Агрегируем статистику
        const stats = await Property.aggregate([
          { $match: propertyFilter },
          {
            $group: {
              _id: null,
              totalUnits: { $sum: 1 },
              priceMin: { $min: '$tags.price' },
              priceMax: { $max: '$tags.price' },
              areaMin: { $min: '$tags.area' },
              areaMax: { $max: '$tags.area' },
              floorMin: { $min: '$tags.floor' },
              floorMax: { $max: '$tags.floor' },
              rooms: { $addToSet: '$tags.rooms' },
              types: { $addToSet: '$tags.type' },
              views: { $addToSet: '$tags.view' },
              finishes: { $addToSet: '$tags.finishing' },
              payments: { $addToSet: '$tags.payment' }
            }
          }
        ]);

        // Получаем превью-объект для изображения
        const previewProperty = await Property.findOne(propertyFilter)
          .select('tags.title tags.rooms tags.area tags.finishing tags.view')
          .sort('tags.price');

        return {
          ...complex.toObject(),
          stats: stats[0] || {
            totalUnits: 0,
            priceMin: null,
            priceMax: null,
            areaMin: null,
            areaMax: null,
            floorMin: null,
            floorMax: null,
            rooms: [],
            types: [],
            views: [],
            finishes: [],
            payments: []
          },
          previewProperty: previewProperty ? {
            title: previewProperty.tags.title || `${complex.name}`,
            tags: previewProperty.tags
          } : null
        };
      })
    );

    // Получаем общее количество комплексов после фильтрации
    const total = await Complex.countDocuments(complexFilter);

    res.json({
      total,
      complexes: complexesWithStats
    });
  } catch (err) {
    console.error('Ошибка в /api/complexes:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Получить детальную информацию о комплексе
router.get('/details', async (req, res) => {
  try {
    const { developer, complex } = req.query;

    if (!developer || !complex) {
      return res.status(400).json({ error: 'Необходимы параметры developer и complex' });
    }

    const complexData = await Complex.findOne({
      developerSlug: developer,
      slug: complex,
      status: 'active'
    }).populate('developerId', 'name slug description logo');

    if (!complexData) {
      return res.status(404).json({ error: 'Комплекс не найден' });
    }

    // Агрегируем статистику по объектам
    const propertyStats = await Property.aggregate([
      {
        $match: {
          developerSlug: developer,
          complexSlug: complex,
          status: 'active'
        }
      },
      {
        $group: {
          _id: null,
          totalUnits: { $sum: 1 },
          priceMin: { $min: '$tags.price' },
          priceMax: { $max: '$tags.price' },
          areaMin: { $min: '$tags.area' },
          areaMax: { $max: '$tags.area' },
          floorMin: { $min: '$tags.floor' },
          floorMax: { $max: '$tags.floor' },
          rooms: { $addToSet: '$tags.rooms' },
          types: { $addToSet: '$tags.type' },
          views: { $addToSet: '$tags.view' },
          finishes: { $addToSet: '$tags.finishing' },
          payments: { $addToSet: '$tags.payment' }
        }
      }
    ]);

    const result = {
      ...complexData.toObject(),
      propertyStats: propertyStats[0] || {}
    };

    res.json(result);
  } catch (err) {
    console.error('Ошибка в /api/complexes/details:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;


