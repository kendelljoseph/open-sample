import express from 'express';
import { Audit } from '../models/record/index.js';
import audit from '../middleware/audit.js';

const router = express.Router();

router.use(audit());

// Get All Audits
router.get('/', async (req, res, next) => {
  try {
    const record = await Audit.findAll();
    const records = record.map(({ dataValues }) => dataValues);

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
    const record = await Audit.findAll({
      where: { event },
    });
    const records = record.map(({ dataValues }) => dataValues);
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
  return null;
});

export default router;
