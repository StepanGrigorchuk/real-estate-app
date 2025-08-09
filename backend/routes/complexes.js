const express = require('express');
const Property = require('../models/Property');
const router = express.Router();

function buildMatchFromQuery(query) {
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
  } = query;

  const match = { status: { $ne: 'removed' } };

  if (priceMin !== undefined || priceMax !== undefined) {
    const price = {};
    if (priceMin !== undefined && priceMin !== '') price.$gte = Number(priceMin);
    if (priceMax !== undefined && priceMax !== '') price.$lte = Number(priceMax);
    if (Object.keys(price).length) match['tags.price'] = price;
  }
  if (areaMin !== undefined || areaMax !== undefined) {
    const area = {};
    if (areaMin !== undefined && areaMin !== '') area.$gte = Number(areaMin);
    if (areaMax !== undefined && areaMax !== '') area.$lte = Number(areaMax);
    if (Object.keys(area).length) match['tags.area'] = area;
  }
  if (floorMin !== undefined || floorMax !== undefined) {
    const floor = {};
    if (floorMin !== undefined && floorMin !== '') floor.$gte = Number(floorMin);
    if (floorMax !== undefined && floorMax !== '') floor.$lte = Number(floorMax);
    if (Object.keys(floor).length) match['tags.floor'] = floor;
  }

  function addIn(field, value) {
    if (value === undefined) return;
    let arr = Array.isArray(value) ? value : [value];
    arr = arr.filter((v) => v !== undefined && v !== null && v !== '');
    if (arr.length > 0) match[`tags.${field}`] = { $in: arr };
  }
  addIn('rooms', rooms);
  addIn('city', city);
  addIn('type', type);
  addIn('view', view);
  addIn('finishing', finishing);
  addIn('payment', payment);

  return match;
}

function buildSort(sort) {
  const sortObj = {};
  if (sort === 'price-asc') sortObj.priceMin = 1;
  if (sort === 'price-desc') sortObj.priceMin = -1;
  if (sort === 'area-asc') sortObj.areaMin = 1;
  if (sort === 'area-desc') sortObj.areaMin = -1;
  // По умолчанию сортировать по названию комплекса
  if (Object.keys(sortObj).length === 0) sortObj['complex'] = 1;
  return sortObj;
}

// Список комплексов (агрегировано из объектов)
router.get('/', async (req, res) => {
  try {
    const { sort, limit = 20, skip = 0 } = req.query;
    const match = buildMatchFromQuery(req.query);

    const groupStage = {
      $group: {
        _id: { developer: '$developer', complex: '$complex' },
        developer: { $first: '$developer' },
        complex: { $first: '$complex' },
        priceMin: { $min: '$tags.price' },
        priceMax: { $max: '$tags.price' },
        areaMin: { $min: '$tags.area' },
        areaMax: { $max: '$tags.area' },
        floorMin: { $min: '$tags.floor' },
        floorMax: { $max: '$tags.floor' },
        rooms: { $addToSet: '$tags.rooms' },
        cities: { $addToSet: '$tags.city' },
        types: { $addToSet: '$tags.type' },
        views: { $addToSet: '$tags.view' },
        finishings: { $addToSet: '$tags.finishing' },
        payments: { $addToSet: '$tags.payment' },
        totalUnits: { $sum: 1 },
      },
    };

    const projectStage = {
      $project: {
        _id: 0,
        developer: 1,
        complex: 1,
        price: { min: '$priceMin', max: '$priceMax' },
        area: { min: '$areaMin', max: '$areaMax' },
        floor: { min: '$floorMin', max: '$floorMax' },
        rooms: 1,
        cities: 1,
        types: 1,
        views: 1,
        finishings: 1,
        payments: 1,
        totalUnits: 1,
      },
    };

    const sortStage = { $sort: buildSort(sort) };

    const [items, totalAgg] = await Promise.all([
      Property.aggregate([
        { $match: match },
        groupStage,
        projectStage,
        sortStage,
        { $skip: Number(skip) },
        { $limit: Number(limit) },
      ]),
      Property.aggregate([{ $match: match }, groupStage, { $count: 'total' }]),
    ]);

    const total = totalAgg[0]?.total || 0;
    res.json({ total, complexes: items });
  } catch (err) {
    console.error('Ошибка в /api/complexes:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Детали одного комплекса + краткие агрегаты
router.get('/details', async (req, res) => {
  try {
    const { developer, complex } = req.query;
    if (!developer || !complex) {
      return res.status(400).json({ error: 'developer and complex are required' });
    }

    const match = { developer, complex, status: { $ne: 'removed' } };
    const [summary] = await Property.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          priceMin: { $min: '$tags.price' },
          priceMax: { $max: '$tags.price' },
          areaMin: { $min: '$tags.area' },
          areaMax: { $max: '$tags.area' },
          floorMin: { $min: '$tags.floor' },
          floorMax: { $max: '$tags.floor' },
          rooms: { $addToSet: '$tags.rooms' },
          cities: { $addToSet: '$tags.city' },
          types: { $addToSet: '$tags.type' },
          views: { $addToSet: '$tags.view' },
          finishings: { $addToSet: '$tags.finishing' },
          payments: { $addToSet: '$tags.payment' },
          totalUnits: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          developer: developer,
          complex: complex,
          price: { min: '$priceMin', max: '$priceMax' },
          area: { min: '$areaMin', max: '$areaMax' },
          floor: { min: '$floorMin', max: '$floorMax' },
          rooms: 1,
          cities: 1,
          types: 1,
          views: 1,
          finishings: 1,
          payments: 1,
          totalUnits: 1,
        },
      },
    ]);

    res.json({ summary: summary || null });
  } catch (err) {
    console.error('Ошибка в /api/complexes/details:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;


