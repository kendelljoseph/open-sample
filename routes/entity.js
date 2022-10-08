const express = require('express');

const router = express.Router();
const { Entity } = require('../models');
const { validation } = require('../controllers');

const { isEntity, isRecord } = validation;

// Create Entity
router.post('/', async (req, res, exit) => {
  const { body } = req;

  // Validation
  const errors = isEntity(body);
  if (errors.length) {
    return exit({ statusCode: 400, message: errors });
  }

  // Model
  const entity = await Entity.create(body, {
    fields: ['name'],
  });

  const record = entity.dataValues;

  // Respond
  res.json(record);
});

// Get All Entities
router.get('/', async (req, res) => {
  // Model
  const entities = await Entity.findAll();
  const records = entities.map((entity) => entity.dataValues);

  res.json(records);
});

// Get Entity by Id
router.get('/:id', async (req, res, exit) => {
  const { id } = req.params;

  // Validation
  const errors = isRecord(req.params);
  if (errors.length) {
    return exit({ statusCode: 400, message: errors });
  }

  // Model
  const entity = await Entity.findByPk(id);
  const record = entity && entity.dataValues;

  // Respond
  res.json(record);
});

// Update an Entity by Id
router.put('/:id', async (req, res, exit) => {
  const { id } = req.params;
  const { body } = req;

  // Validation
  const errors = [isEntity(body), isRecord(req.params)].flat();
  if (errors.length) {
    return exit({ statusCode: 400, message: errors });
  }

  // Model
  const record = await Entity.update(body, { fields: ['name'], where: { id } });

  // Respond
  res.json(record);
});

// Delete an Entity by Id
router.delete('/:id', async (req, res, exit) => {
  const { id } = req.params;

  // Validation
  const errors = isRecord(req.params);
  if (errors.length) {
    return exit({ statusCode: 400, message: errors });
  }

  const record = await Entity.destroy({ where: { id } });

  // Respond
  res.json(record);
});

module.exports = router;
