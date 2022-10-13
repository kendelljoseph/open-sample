import express from 'express';
import twilio from 'twilio';
import authn from '../middleware/authn.js';
import audit from '../middleware/audit.js';
import validation from '../controllers/validation.js';
import enqueue from '../lib/enqueue.js';
import Neo4jDatabaseConnection from '../database/neo4j.js';
import { APP } from '../config/index.js';
import { SMSReciept } from '../models/record/index.js';

const router = express.Router();

const { isSMS } = validation;

router.use(authn());
router.use(audit());

// Ai Prompts
router.post('/send', async (req, res, next) => {
  const { body } = req;
  const appEvent = req.headers['x-app-audit-event'] || 'unknown-sms-event';

  // Validation
  const errors = isSMS(body);
  if (errors.length) {
    return next({ statusCode: 400, message: errors });
  }

  enqueue(
    req.authz ? req.authz.token : 'unauthorized',
    async () => {
      const smsSenderPhone = APP.TWILIO_NUMBER;
      const client = twilio(APP.TWILIO_ACCOUNT_SID, APP.TWILIO_AUTH_TOKEN);
      client.messages
        .create({ body: body.message, from: smsSenderPhone, to: body.to })
        .then(async (message) => {
          // Model
          await SMSReciept.create(
            {
              to: body.to,
              twilioSid: message.sid,
            },
            {
              fields: ['to', 'twilioSid'],
            },
          );

          // Graph
          const graph = new Neo4jDatabaseConnection();
          const graphErr = await graph.write(
            `
                MATCH (authn:Authn {accessToken: $accessToken})
                MERGE (from:PhoneNumber {phoneNumber: $from})
                MERGE (to:PhoneNumber {phoneNumber: $to})
                CREATE (sms:SMS {
                  message: $message,
                  twilioSid: $twilioSid
                })
                MERGE (authn)-[:USED_PHONE_NUMBER {timestamp: timestamp()}]->(to)
                MERGE (from)-[:SENT {timestamp: timestamp()}]->(sms)-[:SENT_TO {timestamp: timestamp()}]->(to)
              `,
            {
              accessToken: req.authz && req.authz.token,
              from: smsSenderPhone,
              twilioSid: message.sid,
              ...body,
            },
          );
          await graph.disconnect();

          if (graphErr) {
            return next({ statusCode: 400, message: graphErr });
          }

          res.json({
            success: true,
            message: body.message,
          });
          return null;
        });
    },
    next,
    appEvent,
  );
  return null;
});

export default router;
