import axios from 'axios';
import NodeCache from 'node-cache';
import express from 'express';
import audit from '../middleware/audit.js';
import enqueue from '../lib/enqueue.js';
import { APP } from '../config/index.js';
import { User } from '../models/record/index.js';

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
  let tagFound = false;
  if (smsTags) {
    tags.forEach((tag) => {
      if (smsTags.includes(tag)) {
        if (!tagFound) tagFound = true;
      }

      if (['#reset', '#purge', '#status'].includes(tag)) {
        reflectCache.del(FROM);
      }

      if (tagFound) {
        // Remove tag from prompt
        prompt = prompt.replace(tag, '');
      }
    });
  }

  const cachedPrompt = reflectCache.get(FROM);
  if (cachedPrompt) {
    prompt = `${cachedPrompt}\n\n${BODY}`;
  }

  let userAccessToken;
  try {
    const userRecord = await User.findOne({ where: { phoneNumber: FROM } });
    const { accessToken } = userRecord.dataValues;
    userAccessToken = accessToken;
  } catch (error) {
    return next({ statusCode: 403, message: 'Unknown User Phone Number' });
  }

  const config = (eventName) => ({
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
      'x-app-event': eventName,
    },
  });

  if (tagFound) {
    try {
      if (smsTags.includes('#help')) {
        const helpMessage = `${req.protocol}://${req.hostname}\n\n$gift - give a gift ????\n$grant - request a grant ????\n#gig - start gigging ???\n#build "text" - build an experience\n#purge - purge all records \n#save "text" - save a text\n#help - show this list again`;
        await axios.post(
          smsUrl,
          { to: FROM, message: helpMessage },
          { ...config('reflect:#help') },
        );
        return res.json({ response: helpMessage });
      }

      if (smsTags.includes('#save')) {
        await axios.post(
          entityUrl,
          { name: '#save', prompt },
          { ...config('reflect:#save') },
        );
      }

      if (smsTags.includes('$gift')) {
        const giftMessage = `$gift - give a gift ????\n**GIVE A GIFT**\n\n\n${prompt}\n\nUse this link to complete a secure gift transaction using Stripe.\n${APP.STRIPE_GIFT_URL}`;
        await axios.post(giftUrl, { name: prompt }, { ...config('reflect:$gift') });
        await axios.post(
          smsUrl,
          {
            to: FROM,
            message: giftMessage,
          },
          { ...config('reflect:$gift:stripe-url') },
        );
        return res.json({ response: giftMessage });
      }

      if (smsTags.includes('$grant')) {
        const grantMessage = `$grant - request a grant ????\n**GRANT REQUESTED**\n\n${prompt}\n\nShare this link to anyone who would like to support this grant.\n${APP.STRIPE_GRANT_URL}`;
        await axios.post(grantUrl, { name: prompt }, { ...config('reflect:$grant') });
        await axios.post(
          smsUrl,
          {
            to: FROM,
            message: grantMessage,
          },
          { ...config('reflect:$gift:stripe-url') },
        );
        return res.json({ response: grantMessage });
      }

      if (smsTags.includes('#build')) {
        const buildMessage = `#build - build a user experience\n\n${prompt}\n\nUse this link to view this build.\n${APP.PUBLIC_OS_URL}`;
        await axios.post(
          smsUrl,
          {
            to: FROM,
            message: buildMessage,
          },
          { ...config('reflect:#build') },
        );
        return res.json({ response: buildMessage });
      }

      await axios.post(smsUrl, { to: FROM, message: 'Okay' }, { ...config('reflect:okay') });
    } catch (error) {
      res.json({ response: error && error.message });
      return next(error);
    }

    if (smsTags.includes('#purge')) {
      res.json({ response: 'Okay' });
    } else {
      res.json({ response: 'unknown tag error - you should not be seeing this.' });
    }
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
          smsPayload = { to: FROM, message: '???? IDK' };
          await axios.post(smsUrl, smsPayload, { ...config('reflect:prompt:error') });
          res.end();
          return;
        }

        await axios.post(smsUrl, smsPayload, { ...config('reflect:prompt:success') });
        const newCachedPrompt = `${prompt}\n\n${data.response}`;
        reflectCache.set(FROM, newCachedPrompt);

        res.json(data);
      } catch (error) {
        next(error);
      }
    },
    next,
    'reflect ????',
  );
  return null;
});

export default router;
