import express from 'express';

import authn from '../middleware/authn.js';
import audit from '../middleware/audit.js';
import Neo4jDatabaseConnection from '../database/neo4j.js';
import { User } from '../models/record/index.js';
import validation from '../controllers/validation.js';
import enqueue from '../lib/enqueue.js';

const router = express.Router();

const { isUser, isRecord } = validation;

router.use(authn());
router.use(audit());

// Create User
router.post('/', async (req, res, exit) => {
  const { body } = req;

  // Validation
  const errors = isUser(body);
  if (errors.length) {
    return exit({ statusCode: 400, message: errors });
  }
  const appEvent = req.appAuditEvent;
  enqueue(
    req.authz.token,
    async () => {
      // Model
      const user = await User.create(body, {
        fields: ['displayName', 'email', 'googleId', 'accessToken', 'phoneNumber'],
      });

      const record = user.dataValues;

      // Graph
      const graph = new Neo4jDatabaseConnection();
      const graphErr = await graph.write(
        `
          MATCH (authn:Authn {accessToken: $accessToken})
          CREATE (user:User {
            displayName: $displayName,
            googleId: $googleId,
            accessToken: $accessToken,
            createdAt: timestamp(),
            updatedAt: timestamp()
          })
          MERGE (email:Email {address: $email})
          MERGE (phoneNumber:PhoneNumber {phoneNumber: $phoneNumber})

          MERGE (user)-[:USING_EMAIL]->(email)
          MERGE (user)-[:USING_PHONE_NUMBER]->(phoneNumber)
          MERGE (user)-[:CREATED_BY]->(authn)
        `,
        {
          accessToken: req.authz && req.authz.token,
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
      const entities = await User.findAll();
      const records = entities.map((user) => user.dataValues);

      req.localCache.set(cacheKey, records);
      return res.json(records);
    },
    exit,
    appEvent,
  );
});

// Get User by Id
router.get('/:id', async (req, res, exit) => {
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

      const cacheKey = req.localCache.generateRequestKey(req);

      if (req.localCache.has(cacheKey)) {
        const cache = req.localCache.get(cacheKey);
        return res.json(cache);
      }

      const user = await User.findByPk(id);
      const record = user && user.dataValues;

      req.localCache.set(cacheKey, record);
      res.json(record);
      return null;
    },
    exit,
    appEvent,
  );
});

// Update an User by Id
router.put('/:id', async (req, res, exit) => {
  const { id } = req.params;
  const { body } = req;

  const appEvent = req.appAuditEvent;
  enqueue(
    req.authz.token,
    async () => {
      // Validation
      const errors = [isUser(body), isRecord(req.params)].flat();
      if (errors.length) {
        return exit({ statusCode: 400, message: errors });
      }

      const record = await User.update(body, {
        fields: ['displayName', 'email', 'googleId', 'accessToken', 'phoneNumber'],
        where: { googleId: id },
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

// Delete an User by Id
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

      const record = await User.destroy({ where: { id } });

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

export default router;
