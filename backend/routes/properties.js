const express = require('express');
const Property = require('../models/Property');
const router = express.Router();

// Получить объекты с фильтрацией, сортировкой и пагинацией
router.get('/', async (req, res) => {
  try {
    const {
      priceMin,
      priceMax,
      areaMin,
      areaMax,
      deliveryMin,
      deliveryMax,
      floorMin,
      floorMax,
      rooms,
      city,
      type,
      view,
      finishing,
      payment,
      'sea-distance': seaDistance,
      sort,
      limit = 20,
      skip = 0,
    } = req.query;

    const filter = {};
    if (priceMin || priceMax) filter['tags.price'] = {};
    if (priceMin) filter['tags.price'].$gte = Number(priceMin);
    if (priceMax) filter['tags.price'].$lte = Number(priceMax);
    if (areaMin || areaMax) filter['tags.area'] = {};
    if (areaMin) filter['tags.area'].$gte = Number(areaMin);
    if (areaMax) filter['tags.area'].$lte = Number(areaMax);
    if (deliveryMin || deliveryMax) filter['tags.delivery'] = {};
    if (deliveryMin) filter['tags.delivery'].$gte = Number(deliveryMin);
    if (deliveryMax) filter['tags.delivery'].$lte = Number(deliveryMax);
    if (floorMin || floorMax) filter['tags.floor'] = {};
    if (floorMin) filter['tags.floor'].$gte = Number(floorMin);
    if (floorMax) filter['tags.floor'].$lte = Number(floorMax);
    if (rooms) filter['tags.rooms'] = { $in: Array.isArray(rooms) ? rooms : [rooms] };
    if (city) filter['tags.city'] = { $in: Array.isArray(city) ? city : [city] };
    if (type) filter['tags.type'] = { $in: Array.isArray(type) ? type : [type] };
    if (view) filter['tags.view'] = { $in: Array.isArray(view) ? view : [view] };
    if (finishing) filter['tags.finishing'] = { $in: Array.isArray(finishing) ? finishing : [finishing] };
    if (payment) filter['tags.payment'] = { $in: Array.isArray(payment) ? payment : [payment] };
    if (seaDistance) filter['tags.sea-distance'] = { $in: Array.isArray(seaDistance) ? seaDistance : [seaDistance] };

    let sortObj = {};
    if (sort === 'price-asc') sortObj['tags.price'] = 1;
    if (sort === 'price-desc') sortObj['tags.price'] = -1;
    if (sort === 'area-asc') sortObj['tags.area'] = 1;
    if (sort === 'area-desc') sortObj['tags.area'] = -1;

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
    const property = new Property(req.body);
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
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
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