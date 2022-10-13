/* eslint-disable no-console */
import axios from 'axios';
import express from 'express';
import audit from '../middleware/audit.js';
import enqueue from '../lib/enqueue.js';
import { APP } from '../config/index.js';

const router = express.Router();

router.use(audit());

// Reflect
router.post('/:app', async (req, res, next) => {
  console.info(req.headers);
  console.info(req.body);
  console.info(req.params);

  // Validate App
  if (req.params.app !== APP.TWILIO_TWIML_SID) {
    return next({ statusCode: 403, message: 'Unknown App Reflection' });
  }

  const { body } = req;
  const FROM = body.From;
  const BODY = body.Body;
  const prompt = BODY;

  enqueue(
    FROM,
    async () => {
      const payload = {
        prompt,
      };

      const aiUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${
        req.headers.host
      }/api/v1/ai/prompt`;
      const smsUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${
        req.headers.host
      }/api/v1/sms/send`;
      const config = {
        headers: {
          Authorization: `Bearer ${APP.REFLECT_ACCESS_TOKEN}`,
          'x-app-audit-event': 'reflect-api-call',
        },
      };

      try {
        const { data } = await axios.post(aiUrl, payload, config);
        const smsPayload = { to: FROM, message: data.response };

        await axios.post(smsUrl, smsPayload, { ...config });
        res.end();
      } catch (error) {
        next(error);
      }
    },
    next,
    'reflect',
  );
  return null;
});

export default router;
