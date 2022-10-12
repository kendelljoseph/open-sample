import axios from 'axios';
import express from 'express';
import authn from '../middleware/authn.js';
import enqueue from '../lib/enqueue.js';
import { APP } from '../config/index.js';

const router = express.Router();

router.use(authn());

// Get All Audits
router.post('/', async (req, res, next) => {
  const appEvent = req.headers['x-app-audit-event'] || 'unknown-event';

  enqueue(
    req.authz ? req.authz.token : 'unauthorized',
    async () => {
      const payload = {
        model: 'text-davinci-002',
        prompt: req.body.prompt,
        temperature: 0.8,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: ['service:', 'user:', 'asker:'],
      };

      const url = APP.OPENAI_COMPLETIONS_URL;
      const config = {
        headers: {
          Authorization: `Bearer ${APP.OPENAI_API_KEY}`,
        },
      };

      axios
        .post(url, payload, config)
        .then(({ data }) => {
          res.json(
            data.choices && data.choices.length
              ? { prompt: req.body.prompt, response: data.choices[0].text }
              : data,
          );
        })
        .catch((error) => {
          next(error);
        });
    },
    next,
    appEvent,
  );
  return null;
});

export default router;
