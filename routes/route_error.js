import express from 'express';
import { RouteError } from '../models/record/index.js';

import audit from '../middleware/audit.js';
import enqueue from '../lib/enqueue.js';

const router = express.Router();

router.use(audit());

// Get All RouteError
router.get('/', async (req, res, next) => {
  enqueue(
    req.authz ? req.authz.token : 'unauthorized',
    async () => {
      const error = await RouteError.findAll();
      const records = error.map(({ dataValues }) => dataValues);

      res.status(200).json(records);
    },
    next,
    'admin:route error',
  );

  return null;
});

// Get RouteError by Event
router.get('/:event', async (req, res, next) => {
  enqueue(
    req.authz ? req.authz.token : 'unauthorized',
    async () => {
      const { event } = req.params;
      const error = await RouteError.findOne({
        where: { event },
      });
      const record = error && error.dataValues;

      res.status(200).json(record);
    },
    next,
    'admin:route error',
  );
  return null;
});

export default router;
