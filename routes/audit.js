const express = require('express');
const router = express.Router()
const { Audit } = require('../models');

// Get All Audits
router.get('/', async (req, res, next) => {
  try {
    const audit = await Audit.findAll();
    const records = audit.map(({dataValues}) => { return dataValues;});
    
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
});

// Get Audit by Event
router.get('/:event', async (req, res, next) => {
  const event = req.params.event;

  try {
    const audit = await Audit.findOne({
      where: {event}
    });
    const record = audit && audit.dataValues;
    res.status(200).json(record);
  } catch (error) {
    next(error);
  }

});

module.exports = router;