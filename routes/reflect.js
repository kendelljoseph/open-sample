import axios from 'axios';
import NodeCache from 'node-cache';
import express from 'express';
import audit from '../middleware/audit.js';
import enqueue from '../lib/enqueue.js';
import { APP } from '../config/index.js';

const router = express.Router();

router.use(audit());

const reflectCache = new NodeCache({ stdTTL: 100000, checkperiod: 10 });

// Reflect
router.post('/:app', async (req, res, next) => {
  // Validate App
  if (req.params.app !== APP.TWILIO_TWIML_SID) {
    return next({ statusCode: 403, message: 'Unknown App Reflection' });
  }

  const { body } = req;
  const FROM = body.From;
  const BODY = body.Body;
  const hashtags = String(BODY).match(/#[a-z0-9_]+/g);
  const tags = ['#reset', '#status', '#load', '#save', '#purge'];

  let prompt = BODY;
  let cacheKey = FROM;
  let tagFound = false;
  if (hashtags) {
    cacheKey = `${FROM}:${hashtags.join(':')}`;
    tags.forEach((tag) => {
      if (hashtags.includes(tag)) {
        if (!tagFound) tagFound = true;
        reflectCache.del(cacheKey);
      }
    });
  }

  const cachedPrompt = reflectCache.get(cacheKey);
  if (cachedPrompt) {
    prompt = `${cachedPrompt}\n\n${BODY}`;
  }

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

  if (tagFound) {
    try {
      await axios.post(smsUrl, { to: FROM, message: 'Okay' }, { ...config });
    } catch (error) {
      return next(error);
    }
  }

  enqueue(
    FROM,
    async () => {
      const payload = {
        prompt,
      };

      try {
        const { data } = await axios.post(aiUrl, payload, config);
        let smsPayload = {};
        if (data.response) {
          smsPayload = { to: FROM, message: data.response };
        } else {
          // eslint-disable-next-line no-console
          console.error('reflect:api/prompt:no-response'.bgRed, data);
          smsPayload = { to: FROM, message: '🤷 IDK' };
          await axios.post(smsUrl, smsPayload, { ...config });
          res.end();
          return;
        }

        await axios.post(smsUrl, smsPayload, { ...config });
        const newCachedPrompt = `${prompt}\n\n${data.response}`;
        reflectCache.set(cacheKey, newCachedPrompt);

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
