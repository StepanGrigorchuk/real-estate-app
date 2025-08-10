const express = require('express');
const Property = require('../models/Property');
const Complex = require('../models/Complex');
const Developer = require('../models/Developer');

const router = express.Router();

// Получить объекты с фильтрацией, сортировкой и пагинацией
router.get('/', async (req, res) => {
  try {
    const {
      developer,
      complex,
      priceMin,
      priceMax,
      areaMin,
      areaMax,
      floorMin,
      floorMax,
      rooms,
      city,
      type,
      view,
      finishing,
      payment,
      sort,
      limit = 20,
      skip = 0,
    } = req.query;

    // --- ФОРМИРОВАНИЕ ФИЛЬТРА ---
    const filter = { status: 'active' };

    // Фильтры по верхнеуровневым полям
    if (developer) filter.developerSlug = developer;
    if (complex) filter.complexSlug = complex;

    // Диапазоны
    if (priceMin !== undefined || priceMax !== undefined) {
      const priceFilter = {};
      if (priceMin !== undefined && priceMin !== '') priceFilter.$gte = Number(priceMin);
      if (priceMax !== undefined && priceMax !== '') priceFilter.$lte = Number(priceMax);
      if (Object.keys(priceFilter).length) filter['tags.price'] = priceFilter;
    }
    if (areaMin !== undefined || areaMax !== undefined) {
      const areaFilter = {};
      if (areaMin !== undefined && areaMin !== '') areaFilter.$gte = Number(areaMin);
      if (areaMax !== undefined && areaMax !== '') areaFilter.$lte = Number(areaMax);
      if (Object.keys(areaFilter).length) filter['tags.area'] = areaFilter;
    }
    if (floorMin !== undefined || floorMax !== undefined) {
      const floorFilter = {};
      if (floorMin !== undefined && floorMin !== '') floorFilter.$gte = Number(floorMin);
      if (floorMax !== undefined && floorMax !== '') floorFilter.$lte = Number(floorMax);
      if (Object.keys(floorFilter).length) filter['tags.floor'] = floorFilter;
    }

    // Фильтры-списки
    function addInFilter(field, value) {
      if (value === undefined) return;
      let arr = Array.isArray(value) ? value : [value];
      arr = arr.filter(v => v !== undefined && v !== null && v !== '');
      if (arr.length > 0) filter[`tags.${field}`] = { $in: arr };
    }
    addInFilter('rooms', rooms);
    addInFilter('city', city);
    addInFilter('type', type);
    addInFilter('view', view);
    addInFilter('finishing', finishing);
    addInFilter('payment', payment);

    // --- СОРТИРОВКА ---
    let sortObj = {};
    if (sort === 'price-asc') sortObj['tags.price'] = 1;
    if (sort === 'price-desc') sortObj['tags.price'] = -1;
    if (sort === 'area-asc') sortObj['tags.area'] = 1;
    if (sort === 'area-desc') sortObj['tags.area'] = -1;

    // DEBUG: log filter and query
    console.log('FILTER:', JSON.stringify(filter), 'QUERY:', JSON.stringify(req.query));

    const total = await Property.countDocuments(filter);
    const properties = await Property.find(filter)
      .populate('developerId', 'name slug')
      .populate('complexId', 'name slug city')
      .sort(sortObj)
      .skip(Number(skip))
      .limit(Number(limit));

    res.json({ total, properties });
  } catch (err) {
    console.error('Ошибка в /api/properties:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Получить диапазоны min/max для числовых фильтров по всей базе
router.get('/ranges', async (req, res) => {
  try {
    const { developer, complex } = req.query;
    
    const match = { status: 'active' };
    if (developer) match.developerSlug = developer;
    if (complex) match.complexSlug = complex;

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: null,
          priceMin: { $min: "$tags.price" },
          priceMax: { $max: "$tags.price" },
          areaMin: { $min: "$tags.area" },
          areaMax: { $max: "$tags.area" },
          floorMin: { $min: "$tags.floor" },
          floorMax: { $max: "$tags.floor" }
        }
      },
      {
        $project: {
          _id: 0,
          price: { min: "$priceMin", max: "$priceMax" },
          area: { min: "$areaMin", max: "$areaMax" },
          floor: { min: "$floorMin", max: "$floorMax" }
        }
      }
    ];

    const [ranges] = await Property.aggregate(pipeline);
    res.json(ranges || { price: {}, area: {}, floor: {} });
  } catch (err) {
    console.error('Ошибка в /api/properties/ranges:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Получить уникальные значения для фильтров
router.get('/filter-options', async (req, res) => {
  try {
    const { developer, complex } = req.query;
    
    const match = { status: 'active' };
    if (developer) match.developerSlug = developer;
    if (complex) match.complexSlug = complex;

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: null,
          rooms: { $addToSet: "$tags.rooms" },
          cities: { $addToSet: "$tags.city" },
          types: { $addToSet: "$tags.type" },
          views: { $addToSet: "$tags.view" },
          finishes: { $addToSet: "$tags.finishing" },
          payments: { $addToSet: "$tags.payment" }
        }
      }
    ];

    const [options] = await Property.aggregate(pipeline);
    
    // Фильтруем пустые значения и сортируем
    const result = {};
    if (options) {
      Object.keys(options).forEach(key => {
        if (key !== '_id') {
          result[key] = options[key]
            .filter(val => val !== null && val !== undefined && val !== '')
            .sort();
        }
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Ошибка в /api/properties/filter-options:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Создать новый объект
router.post('/', async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      lastSeenAt: new Date(),
      updatedBy: req.body.updatedBy || 'system'
    };

    const property = new Property(propertyData);
    await property.save();
    res.status(201).json(property);
  } catch (err) {
    console.error('Ошибка в POST /api/properties:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Обновить объект
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      lastSeenAt: new Date(),
      updatedBy: req.body.updatedBy || 'system'
    };

    const property = await Property.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({ error: 'Объект не найден' });
    }

    res.json(property);
  } catch (err) {
    console.error('Ошибка в PUT /api/properties/:id:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Удалить объект (мягкое удаление)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const property = await Property.findByIdAndUpdate(
      id,
      { 
        status: 'removed',
        lastSeenAt: new Date(),
        updatedBy: req.body.updatedBy || 'system'
      },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ error: 'Объект не найден' });
    }

    res.json({ message: 'Объект успешно удалён', property });
  } catch (err) {
    console.error('Ошибка в DELETE /api/properties/:id:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;