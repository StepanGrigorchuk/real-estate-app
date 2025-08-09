const express = require('express');
const Property = require('../models/Property');
const router = express.Router();
  
function isNonEmpty(val) {
  if (Array.isArray(val)) return val.length > 0 && val.some(v => v && v !== '');
  return val != null && val !== '';
}

// Получить объекты с фильтрацией, сортировкой и пагинацией
router.get('/', async (req, res) => {
  try {
    const {
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
      developer,
      complex,
      sort,
      limit = 20,
      skip = 0,
    } = req.query;

    // --- ФОРМИРОВАНИЕ ФИЛЬТРА ---
    const filter = {};

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

    // Фильтры по верхнеуровневым полям
    function addTopLevelIn(field, value) {
      if (value === undefined) return;
      let arr = Array.isArray(value) ? value : [value];
      arr = arr.filter(v => v !== undefined && v !== null && v !== '');
      if (arr.length > 0) filter[field] = { $in: arr };
    }
    addTopLevelIn('developer', developer);
    addTopLevelIn('complex', complex);

    // --- СОРТИРОВКА ---
    let sortObj = {};
    if (sort === 'price-asc') sortObj['tags.price'] = 1;
    if (sort === 'price-desc') sortObj['tags.price'] = -1;
    if (sort === 'area-asc') sortObj['tags.area'] = 1;
    if (sort === 'area-desc') sortObj['tags.area'] = -1;

    // DEBUG: log filter and query
    console.log('FILTER:', JSON.stringify(filter), 'QUERY:', JSON.stringify(req.query));

    // Исключаем удалённые
    filter.status = { $ne: 'removed' };

    const total = await Property.countDocuments(filter);
    const properties = await Property.find(filter)
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
    const pipeline = [
      {
        $group: {
          _id: null,
          priceMin: { $min: "$tags.price" },
          priceMax: { $max: "$tags.price" },
          areaMin: { $min: "$tags.area" },
          areaMax: { $max: "$tags.area" },
          deliveryMin: { $min: "$tags.delivery" },
          deliveryMax: { $max: "$tags.delivery" },
          floorMin: { $min: "$tags.floor" },
          floorMax: { $max: "$tags.floor" }
        }
      },
      {
        $project: {
          _id: 0,
          price: { min: "$priceMin", max: "$priceMax" },
          area: { min: "$areaMin", max: "$areaMax" },
          delivery: { min: "$deliveryMin", max: "$deliveryMax" },
          floor: { min: "$floorMin", max: "$floorMax" }
        }
      }
    ];
    const result = await Property.aggregate(pipeline);
    if (!result[0]) {
      // Fallback: если нет данных, возвращаем структуру с null
      return res.json({
        price: { min: null, max: null },
        area: { min: null, max: null },
        delivery: { min: null, max: null },
        floor: { min: null, max: null }
      });
    }
    res.json(result[0]);
  } catch (err) {
    console.error('Ошибка в /api/properties/ranges:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Получить объект по id
router.get('/:id', async (req, res) => {
  try {
    let property;
    // Проверяем, является ли id валидным ObjectId
    if (/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
      property = await Property.findById(req.params.id);
    } else {
      property = await Property.findOne({ id: req.params.id });
    }
    if (!property) return res.status(404).json({ error: 'Not found' });
    res.json(property);
  } catch (err) {
    console.error('Ошибка в /api/properties/:id:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Добавить новый объект
router.post('/', async (req, res) => {
  try {
    const payload = {
      ...req.body,
      status: req.body.status || 'active',
      updatedBy: req.headers['x-updated-by'] || 'api',
      lastSeenAt: new Date(),
    };
    const property = new Property(payload);
    await property.save();
    res.status(201).json(property);
  } catch (err) {
    console.error('Ошибка при добавлении объекта:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Обновить объект
router.put('/:id', async (req, res) => {
  try {
    const update = {
      ...req.body,
      updatedBy: req.headers['x-updated-by'] || 'api',
      lastSeenAt: new Date(),
    };
    const property = await Property.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!property) return res.status(404).json({ error: 'Not found' });
    res.json(property);
  } catch (err) {
    console.error('Ошибка при обновлении объекта:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Удалить объект
router.delete('/:id', async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error('Ошибка при удалении объекта:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;