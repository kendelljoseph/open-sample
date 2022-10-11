import express from 'express';
import { Audit } from '../models/record/index.js';

const router = express.Router();

// Get All Audits
router.get('/', async (req, res, next) => {
  try {
    const audit = await Audit.findAll();
    const records = audit.map(({ dataValues }) => dataValues);

    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
  return null;
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
  return null;
});

export default router;
