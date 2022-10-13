/* eslint-disable no-console */
import express from 'express';
import audit from '../middleware/audit.js';

const router = express.Router();

router.use(audit());

// Reflect
router.post('/:app', (req, res) => {
  console.info(req.headers);
  console.info(req.body);
  console.info(req.params);
  res.json({
    headers: req.headers,
    body: req.body,
    params: req.params,
  });
});

export default router;
