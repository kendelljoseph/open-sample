import express from 'express';
import { RouteError } from '../models/record/index.js';

import audit from '../middleware/audit.js';

const router = express.Router();

router.use(audit());

// Get All RouteError
router.get('/', async (req, res) => {
  const error = await RouteError.findAll();
  const records = error.map(({ dataValues }) => dataValues);

  res.status(200).json(records);
  return null;
});

// Get RouteError by Event
router.get('/:event', async (req, res) => {
  const { event } = req.params;
  const error = await RouteError.findOne({
    where: { event },
  });
  const record = error && error.dataValues;

  res.status(200).json(record);
  return null;
});

export default router;
