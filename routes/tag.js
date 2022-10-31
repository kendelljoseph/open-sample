import express from 'express';

import authn from '../middleware/authn.js';
import audit from '../middleware/audit.js';
import Neo4jDatabaseConnection from '../database/neo4j.js';
import validation from '../controllers/validation.js';
import enqueue from '../lib/enqueue.js';

const router = express.Router();

const { isTag } = validation;

router.use(authn());
router.use(audit());

// Create Tag
router.post('/', async (req, res, exit) => {
  const { body } = req;

  // Validation
  const errors = isTag(body);
  if (errors.length) {
    return exit({ statusCode: 400, message: errors });
  }
  const appEvent = req.appAuditEvent;
  enqueue(
    req.authz.token,
    async () => {
      // Graph
      const graph = new Neo4jDatabaseConnection();
      const graphErr = await graph.write(
        `
          MATCH (authn:Authn {accessToken: $accessToken})
          MATCH (entity:Entity)
          WHERE toString(id(entity)) = $entityId
          WITH authn, entity
          
          MERGE (tag:Tag {
            name: $name
          })
          SET tag.slug = apoc.text.slug($name)

          MERGE (entity)-[:TAGGED]->(tag)
          MERGE (authn)-[:ASSOCIATED_TAG]->(tag)
        `,
        {
          accessToken: req.authz && req.authz.token,
          entityId: body.entityId,
          name: body.name,
        },
      );
      await graph.disconnect();

      if (graphErr) {
        return exit({ statusCode: 400, message: graphErr });
      }

      res.json(body);
      return null;
    },
    exit,
    appEvent,
  );
  return null;
});

// Get All Tags
router.get('/', async (req, res, exit) => {
  const appEvent = req.appAuditEvent;
  enqueue(
    req.authz.token,
    async () => {
      const cacheKey = req.localCache.generateRequestKey(req);

      if (req.localCache.has(cacheKey)) {
        const cache = req.localCache.get(cacheKey);
        return res.json(cache);
      }

      // Graph
      const graph = new Neo4jDatabaseConnection();
      const { response, error: graphErr } = await graph.read(
        `
          MATCH (authn:Authn {accessToken: $accessToken})
          MATCH (authn)-[:ASSOCIATED_TAG]->(tag:Tag)
          RETURN {id: toString(id(tag)), name: tag.name, slug: tag.slug} as tag
        `,
        {
          accessToken: req.authz && req.authz.token,
        },
      );
      await graph.disconnect();

      if (graphErr) {
        return exit({ statusCode: 400, message: graphErr });
      }

      const records = response.map((record) => record.get('tag'));

      req.localCache.set(cacheKey, records);
      return res.json(records);
    },
    exit,
    appEvent,
  );
});

export default router;
