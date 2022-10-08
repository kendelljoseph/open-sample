const express = require('express');

const router = express.Router();
const { Entity } = require('../models');

// Create Entity
router.post('/', async (req, res) => {
  const { body } = req;
  const entity = await Entity.create(body, {
    fields: ['name'],
  });

  const record = entity.dataValues;

  res.json(record);
});

// Get All Entities
router.get('/', async (req, res) => {
  const entities = await Entity.findAll();
  const records = entities.map((entity) => entity.dataValues);

  res.json(records);
});

// Get Entity by Id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const entity = await Entity.findOne({
    where: { id },
  });
  const record = entity && entity.dataValues;

  res.json(record);
});

// Update an Entity by Id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  const record = await Entity.update(body, { fields: ['name'], where: { id } });

  res.json(record);
});

// Delete an Entity by Id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const record = await Entity.destroy({ where: { id } });

  res.json(record);
});

module.exports = router;
