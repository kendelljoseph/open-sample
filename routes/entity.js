import express from 'express';

import authn from '../middleware/authn.js';
import audit from '../middleware/audit.js';
import Neo4jDatabaseConnection from '../database/neo4j.js';
import { Entity } from '../models/record/index.js';
import validation from '../controllers/validation.js';
import enqueue from '../lib/enqueue.js';

const router = express.Router();

const { isEntity, isRecord } = validation;

router.use(authn());
router.use(audit());

// Create Entity
router.post('/', async (req, res, exit) => {
  const { body } = req;

  // Validation
  const errors = isEntity(body);
  if (errors.length) {
    return exit({ statusCode: 400, message: errors });
  }
  const appEvent = req.appAuditEvent;
  enqueue(
    req.authz.token,
    async () => {
      // Model
      const entity = await Entity.create(body, {
        fields: ['name', 'prompt'],
      });

      const record = entity.dataValues;

      // Graph
      const graph = new Neo4jDatabaseConnection();
      const graphErr = await graph.write(
        `
          MATCH (authn:Authn {accessToken: $accessToken})
          CREATE (entity:Entity {
            name: $name,
            prompt: $prompt,
            createdAt: timestamp(),
            updatedAt: timestamp()
          })
          
          MERGE (entity)-[:CREATED_BY]->(authn)
        `,
        {
          accessToken: req.authz && req.authz.token,
          key: req.authz && req.authz.key,
          ...record,
        },
      );
      await graph.disconnect();

      if (graphErr) {
        return exit({ statusCode: 400, message: graphErr });
      }

      res.json(record);
      return null;
    },
    exit,
    appEvent,
  );
  return null;
});

// Get All Entities
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
          MATCH (authn)-[:USED_PHONE_NUMBER]->(phone:PhoneNumber)
          MATCH (phone)<-[:USED_PHONE_NUMBER]-(allAuthnz:Authn)
          MATCH (e:Entity)-[:CREATED_BY]->(allAuthnz)
          RETURN {id: toString(id(e)), name: e.name, prompt: e.prompt} as entity
        `,
        {
          accessToken: req.authz && req.authz.token,
        },
      );
      await graph.disconnect();

      if (graphErr) {
        return exit({ statusCode: 400, message: graphErr });
      }

      const records = response.map((record) => record.get('entity'));

      req.localCache.set(cacheKey, records);
      return res.json(records);
    },
    exit,
    appEvent,
  );
});

// Get Entity by Tag
router.get('/:tag', async (req, res, exit) => {
  const { tag } = req.params;

  const appEvent = req.appAuditEvent;
  enqueue(
    req.authz.token,
    async () => {
      // // Validation
      // const errors = isRecord(req.params);
      // if (errors.length) {
      //   return exit({ statusCode: 400, message: errors });
      // }

      // Graph
      const graph = new Neo4jDatabaseConnection();
      const { response, error: graphErr } = await graph.read(
        `
          MATCH (authn:Authn {accessToken: $accessToken})
          MATCH (tag:Tag {slug: $tag})
          MATCH (entity)-[:TAGGED]->(tag)
          RETURN {prompt: entity.prompt, entityName: entity.name, entityId: toString(id(entity))} as entity
        `,
        {
          accessToken: req.authz && req.authz.token,
          tag,
        },
      );
      await graph.disconnect();

      if (graphErr) {
        return exit({ statusCode: 400, message: graphErr });
      }

      const records = response.map((record) => record.get('entity'));

      // Clear Cache
      const cacheKey = req.localCache.generateRequestKey(req);
      if (req.localCache.has(cacheKey)) req.localCache.del(cacheKey);

      if (req.localCache.has(cacheKey)) {
        const cache = req.localCache.get(cacheKey);
        return res.json(cache);
      }

      req.localCache.set(cacheKey, records);
      res.json(records);
      return null;
    },
    exit,
    appEvent,
  );
});

// Update an Entity by Id
router.put('/:id', async (req, res, exit) => {
  const { id } = req.params;
  const { body } = req;

  const appEvent = req.appAuditEvent;
  enqueue(
    req.authz.token,
    async () => {
      // Validation
      const errors = [isEntity(body), isRecord(req.params)].flat();
      if (errors.length) {
        return exit({ statusCode: 400, message: errors });
      }

      const record = await Entity.update(body, {
        fields: ['name', 'prompt'],
        where: { id },
      });

      // Clear Cache
      const cacheKey = req.localCache.generateRequestKey(req);
      if (req.localCache.has(cacheKey)) req.localCache.del(cacheKey);

      res.json(record);
      return null;
    },
    exit,
    appEvent,
  );
});

// Delete an Entity by Id
router.delete('/:id', async (req, res, exit) => {
  const { id } = req.params;

  const appEvent = req.appAuditEvent;
  enqueue(
    req.authz.token,
    async () => {
      // Validation
      const errors = isRecord(req.params);
      if (errors.length) {
        return exit({ statusCode: 400, message: errors });
      }

      // Graph
      const graph = new Neo4jDatabaseConnection();
      const graphErr = await graph.write(
        `
          MATCH (authn:Authn {accessToken: $accessToken})
          MATCH (authn)-[:USED_PHONE_NUMBER]->(phone:PhoneNumber)
          MATCH (phone)<-[:USED_PHONE_NUMBER]-(allAuthnz:Authn)
          MATCH (entity:Entity)-[:CREATED_BY]->(allAuthnz)
          WHERE toString(id(entity)) = $id
          DETACH DELETE entity
        `,
        {
          accessToken: req.authz && req.authz.token,
          id,
        },
      );
      await graph.disconnect();

      if (graphErr) {
        return exit({ statusCode: 400, message: graphErr });
      }

      // Clear Cache
      const cacheKey = req.localCache.generateRequestKey(req);
      if (req.localCache.has(cacheKey)) req.localCache.del(cacheKey);

      res.end();
      return null;
    },
    exit,
    appEvent,
  );
});

export default router;
