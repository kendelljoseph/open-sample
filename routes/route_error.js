const express = require('express');
const router = express.Router()
const { RouteError } = require('../models');

// Get All RouteError
router.get('/', async (req, res) => {
  const error = await RouteError.findAll();
  const records = error.map(({dataValues}) => { return dataValues;});
  
  res.status(200).json(records);
});

// Get RouteError by Event
router.get('/:event', async (req, res) => {
  const event = req.params.event;
  const error = await RouteError.findOne({
    where: {event}
  });
  const record = error && error.dataValues;

  res.status(200).json(record);
});

module.exports = router;