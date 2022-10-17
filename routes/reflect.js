import axios from 'axios';
import NodeCache from 'node-cache';
import express from 'express';
import audit from '../middleware/audit.js';
import enqueue from '../lib/enqueue.js';
import { APP } from '../config/index.js';

const router = express.Router();

router.use(audit());

const reflectCache = new NodeCache({ stdTTL: 100000, checkperiod: 10 });

const apiUrls = (req) => {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const { host } = req.headers;
  return {
    aiUrl: `${protocol}://${host}/api/v1/ai/prompt`,
    smsUrl: `${protocol}://${host}/api/v1/sms/send`,
    entityUrl: `${protocol}://${host}/api/v1/entity`,
    giftUrl: `${protocol}://${host}/api/v1/finance/give-gift`,
    grantUrl: `${protocol}://${host}/api/v1/finance/request-grant`,
  };
};

// Reflect
router.post('/:app', async (req, res, next) => {
  const {
    aiUrl, smsUrl, entityUrl, giftUrl, grantUrl,
  } = apiUrls(req);

  // Validate App
  if (req.params.app !== APP.TWILIO_TWIML_SID) {
    return next({ statusCode: 403, message: 'Unknown App Reflection' });
  }

  const { body } = req;
  const FROM = body.From;
  const BODY = String(body.Body);
  const hashtags = BODY.match(/#[a-z0-9_]+/g);
  const fintags = BODY.match(/\$[a-z0-9_]+/g);
  const smsTags = fintags ? fintags.concat(hashtags) : hashtags;
  const tags = [
    '#help',
    '#reset',
    '#status',
    '#save',
    '#build',
    '#purge',
    '#gig',
    '$gift',
    '$grant',
  ];

  let prompt = BODY;
  let cacheKey = FROM;
  let tagFound = false;
  if (smsTags) {
    cacheKey = `${FROM}:${smsTags.join(':')}`;
    tags.forEach((tag) => {
      if (smsTags.includes(tag)) {
        if (!tagFound) tagFound = true;
      }

      if (['#reset', '#purge', '#status'].includes(tag)) {
        reflectCache.del(cacheKey);
      }

      if (tagFound) {
        // Remove tag from prompt
        prompt = prompt.replace(tag, '');

        // Use tag cache
        cacheKey += `${cacheKey}${tag}`;
      }
    });
  }

  const cachedPrompt = reflectCache.get(cacheKey);
  if (cachedPrompt) {
    prompt = `${cachedPrompt}\n\n${BODY}`;
  }

  const config = (eventName) => ({
    headers: {
      Authorization: `Bearer ${APP.REFLECT_ACCESS_TOKEN}`,
      'x-app-audit-event': eventName,
    },
  });

  if (tagFound) {
    try {
      if (smsTags.includes('#help')) {
        const helpMessage = '$gift - give a gift 💝\n$grant - request a grant 💚\n#gig - start gigging ⭐\n#build "description" - build a user experience\n#purge - purge all records \n#save "text" - save a text\n#help - show this list again\n\nBy the way -- I am a person. You can just talk to me 💬!';
        await axios.post(
          smsUrl,
          { to: FROM, message: helpMessage },
          { ...config('reflect:#help') },
        );
        return res.end();
      }

      if (smsTags.includes('#save')) {
        await axios.post(entityUrl, { name: FROM, prompt }, { ...config('reflect:#save') });
      }

      if (smsTags.includes('$gift')) {
        await axios.post(giftUrl, { name: prompt }, { ...config('reflect:$gift') });
        await axios.post(
          smsUrl,
          {
            to: FROM,
            message: `$gift - give a gift 💝\n**GIVE A GIFT**\n\n\n${prompt}\n\nUse this link to complete a secure gift transaction using Stripe.\n${APP.STRIPE_GIFT_URL}`,
          },
          { ...config('reflect:$gift:stripe-url') },
        );
        return res.end();
      }

      if (smsTags.includes('$grant')) {
        await axios.post(grantUrl, { name: prompt }, { ...config('reflect:$grant') });
        await axios.post(
          smsUrl,
          {
            to: FROM,
            message: `$grant - request a grant 💚\n**GRANT REQUESTED**\n\n${prompt}\n\nShare this link to anyone who would like to support this grant.\n${APP.STRIPE_GRANT_URL}`,
          },
          { ...config('reflect:$gift:stripe-url') },
        );
        return res.end();
      }

      if (smsTags.includes('#build')) {
        await axios.post(
          smsUrl,
          {
            to: FROM,
            message: `#build - build a user experience\n\n${prompt}\n\nUse this link to view this build.\n${APP.PUBLIC_OS_URL}`,
          },
          { ...config('reflect:#build') },
        );
        return res.end();
      }

      await axios.post(smsUrl, { to: FROM, message: 'Okay' }, { ...config('reflect:okay') });
    } catch (error) {
      res.end();
      return next(error);
    }

    res.end();
    return null;
  }

  enqueue(
    FROM,
    async () => {
      const payload = {
        prompt,
      };

      try {
        const { data } = await axios.post(aiUrl, payload, config('reflect:prompt'));
        let smsPayload = {};
        if (data.response) {
          smsPayload = { to: FROM, message: data.response };
        } else {
          // eslint-disable-next-line no-console
          console.error('reflect:prompt:no-response'.bgRed, data);
          smsPayload = { to: FROM, message: '🤷 IDK' };
          await axios.post(smsUrl, smsPayload, { ...config('reflect:prompt:error') });
          res.end();
          return;
        }

        await axios.post(smsUrl, smsPayload, { ...config('reflect:prompt:success') });
        const newCachedPrompt = `${prompt}\n\n${data.response}`;
        reflectCache.set(cacheKey, newCachedPrompt);

        res.end();
      } catch (error) {
        next(error);
      }
    },
    next,
    'reflect 🤔',
  );
  return null;
});

export default router;
