import express from 'express';

import authn from '../middleware/authn.js';
import audit from '../middleware/audit.js';
import Neo4jDatabaseConnection from '../database/neo4j.js';
import validation from '../controllers/validation.js';
import enqueue from '../lib/enqueue.js';

const router = express.Router();

const { isTag, isLocation } = validation;

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
          MATCH (entity:Entity)-[:TAGGED]->(tag)
          RETURN {id: toString(id(tag)), name: tag.name, slug: tag.slug, entityName: entity.name, entityId: toString(id(entity))} as tag
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

// Get All Tag Locations
router.get('/locate', async (req, res, exit) => {
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
          MATCH (tag)-[:LOCATED]->(location)
          RETURN {id: toString(id(tag)), name: tag.name, slug: tag.slug} as tag, {id: toString(id(location)), name: location.name} as location
        `,
        {
          accessToken: req.authz && req.authz.token,
        },
      );
      await graph.disconnect();

      if (graphErr) {
        return exit({ statusCode: 400, message: graphErr });
      }

      const records = response.map((record) => [record.get('location'), record.get('tag')]);

      req.localCache.set(cacheKey, records);
      return res.json(records);
    },
    exit,
    appEvent,
  );
});

// Delete Tag
router.delete('/:slug', async (req, res, exit) => {
  const { slug } = req.params;
  const appEvent = req.appAuditEvent;
  enqueue(
    req.authz.token,
    async () => {
      // Graph
      const graph = new Neo4jDatabaseConnection();
      const { response, error: graphErr } = await graph.read(
        `
          MATCH (authn:Authn {accessToken: $accessToken})
          OPTIONAL MATCH (authn)-[:USED_PHONE_NUMBER]->(phone:PhoneNumber)
          OPTIONAL MATCH (phone)<-[:USED_PHONE_NUMBER]-(allAuthn:Authn)
          WITH allAuthn as authn
          MATCH (authn)-[association:ASSOCIATED_TAG]->(tag:Tag {
            slug: $slug
          })
          
          DELETE association
          RETURN true as success
        `,
        {
          accessToken: req.authz && req.authz.token,
          slug,
        },
      );
      await graph.disconnect();
      if (graphErr) {
        return exit({ statusCode: 400, message: graphErr });
      }

      const records = response.map((record) => record.get('success'));
      if (records.length) {
        res.send(records[0]);
      } else {
        res.send(false);
      }
      return null;
    },
    exit,
    appEvent,
  );
  return null;
});

// Locate Tag
router.post('/locate/:id', async (req, res, exit) => {
  const { id } = req.params;
  const { body } = req;

  // Validation
  const errors = isLocation(body);
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
          MATCH (tag:Tag)
          WHERE toString(id(tag)) = $tagId
          WITH authn, tag
          
          MERGE (location:Location {
            name: $name
          })

          MERGE (tag)-[:LOCATED]->(location)
          MERGE (authn)-[:LOCATED_TAG]->(tag)
          MERGE (authn)-[:DISCOVERED]->(location)
        `,
        {
          accessToken: req.authz && req.authz.token,
          tagId: id,
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

export default router;
