import express from 'express';

import authn from '../middleware/authn.js';
import audit from '../middleware/audit.js';
import enqueue from '../lib/enqueue.js';

import validation from '../controllers/validation.js';
import Neo4jDatabaseConnection from '../database/neo4j.js';

const { isGift, isGrant } = validation;

const router = express.Router();

router.use(authn());
router.use(audit());

// Give Gift
router.post('/give-gift', async (req, res, next) => {
  const { body } = req;

  // Validation
  const errors = isGift(body);
  if (errors.length) {
    return next({ statusCode: 401, message: errors });
  }

  enqueue(
    req.authz ? req.authz.token : 'unauthorized',
    async () => {
      // Graph
      const graph = new Neo4jDatabaseConnection();
      const graphErr = await graph.write(
        `
          CREATE (gift:Gift {name: $name})
          MERGE (authn:Authn {accessToken: $accessToken })
          MERGE (gift)-[:GIVEN_BY]->(authn)
        `,
        {
          name: body.name,
          accessToken: req.authz.token,
        },
      );

      await graph.disconnect();

      if (graphErr) {
        return next({ statusCode: 400, message: graphErr });
      }
      res.status(200).json({ success: true });
      return null;
    },
    next,
    'finance:give-gift',
  );

  return null;
});

// Request Grant
router.post('/request-grant', async (req, res, next) => {
  const { body } = req;

  // Validation
  const errors = isGrant(body);
  if (errors.length) {
    return next({ statusCode: 401, message: errors });
  }

  enqueue(
    req.authz ? req.authz.token : 'unauthorized',
    async () => {
      // Graph
      const graph = new Neo4jDatabaseConnection();
      const graphErr = await graph.write(
        `
          CREATE (grantRequest:GrantRequest {name: $name})
          MERGE (authn:Authn {accessToken: $accessToken })
          MERGE (grantRequest)-[:GIVEN_BY]->(authn)
        `,
        {
          name: body.name,
          accessToken: req.authz.token,
        },
      );

      await graph.disconnect();

      if (graphErr) {
        return next({ statusCode: 400, message: graphErr });
      }
      res.status(200).json({ success: true });
      return null;
    },
    next,
    'finance:request-grant',
  );
  return null;
});

export default router;
