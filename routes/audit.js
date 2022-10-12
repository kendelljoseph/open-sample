import express from 'express';
import { Audit } from '../models/record/index.js';
import audit from '../middleware/audit.js';
import enqueue from '../middleware/lib/enqueue.js';

const router = express.Router();

router.use(audit());

// Get All Audits
router.get('/', async (req, res, next) => {
  enqueue(
    req.authz ? req.authz.token : 'unauthorized',
    async () => {
      try {
        const record = await Audit.findAll();
        const records = record.map(({ dataValues }) => dataValues);

        res.status(200).json(records);
      } catch (error) {
        next(error);
      }
    },
    next,
    'admin:audit',
  );
  return null;
});

// Get Audit by Event
router.get('/:event', async (req, res, next) => {
  const { event } = req.params;
  enqueue(
    req.authz ? req.authz.token : 'unauthorized',
    async () => {
      try {
        const record = await Audit.findAll({
          where: { event },
        });
        const records = record.map(({ dataValues }) => dataValues);
        res.status(200).json(records);
      } catch (error) {
        next(error);
      }
    },
    next,
    `admin:audit:${event}`,
  );
  return null;
});

export default router;
