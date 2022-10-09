const express = require('express');

const router = express.Router();
const { Audit } = require('../models');

// Get All Audits
router.get('/', async (req, res, next) => {
  try {
    const audit = await Audit.findAll();
    const records = audit.map(({ dataValues }) => dataValues);

    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
});

// Get Audit by Event
router.get('/:event', async (req, res, next) => {
  const { event } = req.params;

  try {
    const audit = await Audit.findAll({
      where: { event },
    });
    const records = audit.map(({ dataValues }) => dataValues);
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
