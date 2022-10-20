import express from 'express';
import twilio from 'twilio';
import authn from '../middleware/authn.js';
import audit from '../middleware/audit.js';
import validation from '../controllers/validation.js';
import enqueue from '../lib/enqueue.js';
import Neo4jDatabaseConnection from '../database/neo4j.js';
import { APP } from '../config/index.js';
import { User } from '../models/record/index.js';

const router = express.Router();
const client = twilio(APP.TWILIO_ACCOUNT_SID, APP.TWILIO_AUTH_TOKEN);

const { isUser } = validation;

router.use(authn());
router.use(audit());

// Ai Prompts
router.post('/', async (req, res, next) => {
  const { body } = req;
  const appEvent = req.appAuditEvent;

  // Validation
  const errors = isUser(body);
  if (errors.length) {
    return next({ statusCode: 400, message: errors });
  }

  enqueue(
    req.authz ? req.authz.token : 'unauthorized',
    async () => {
      let twilioData;
      try {
        twilioData = await client.validationRequests.create({
          friendlyName: body.displayName,
          phoneNumber: body.phoneNumber,
        });
      } catch (error) {
        res.status(200).json({ message: error.message });
        return;
      }

      try {
        // Model
        await User.update(
          { phoneNumber: twilioData.phoneNumber },
          {
            fields: ['phoneNumber'],
            where: { accessToken: req.authz && req.authz.token },
          },
        );

        // Graph
        const graph = new Neo4jDatabaseConnection();
        const graphErr = await graph.write(
          `
                MATCH (authn:Authn {accessToken: $accessToken})
                MERGE (passport:Passport {accessTokenSecret: $accessTokenSecret})
                MERGE (phone:PhoneNumber {phoneNumber: $phoneNumber})
                MERGE (phone)<-[:PHONE_VERIFICATION_ATTEMPT]-(passport)
                MERGE (phone)<-[:ASSOCIATED_PHONE_NUMBER]-(authn)
              `,
          {
            accessToken: req.authz && req.authz.token,
            accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
            ...body,
          },
        );
        await graph.disconnect();

        if (graphErr) {
          next({ statusCode: 400, message: graphErr });
        }

        res.json({
          displayName: body.displayName,
          email: body.email,
          phoneNumber: twilioData.phoneNumber,
          validationCode: twilioData.validationCode,
        });
      } catch (error) {
        next(error);
      }
    },
    next,
    appEvent,
  );
  return null;
});

export default router;
