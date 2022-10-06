const express = require('express')
const router = express.Router()
const { Entitiy } = require('../models');

// Create Entity
router.post('/', async (req, res) => {
  const body = req.body;
  const entitiy = await Entitiy.create(body, {
    fields: ['name']
  });

  const record = entitiy.dataValues;

  res.json(record);
});

// Get All Entities
router.get('/', async (req, res) => {
  const entities = await Entitiy.findAll()
  const records = entities.map((entitiy) => {
    return entitiy.dataValues;
  });
  
  res.json(records);
});

// Get Entitiy by Id
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const entitiy = await Entitiy.findOne({
    where: {id}
  });
  const record = entitiy && entitiy.dataValues;

  res.json(record);
});

// Update an Entitity by Id
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const record = await Entitiy.update(
    body,
    {fields: ['name'], where: {id}}
  );
  
  res.json(record);
});

// Delete an Entitiy by Id
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  const record = await Entitiy.destroy(
    {where: {id}}
  );
  
  res.json(record);
});

module.exports = router;