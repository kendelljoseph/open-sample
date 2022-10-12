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
  const appEvent = req.headers['x-app-audit-event'] || 'unknown-event';
  enqueue(
    req.authz.token,
    async () => {
      // Model
      const entity = await Entity.create(body, {
        fields: ['name'],
      });

      const record = entity.dataValues;

      // Graph
      const graph = new Neo4jDatabaseConnection();
      const graphErr = await graph.write(
        `
          MATCH (authn:Authn {accessToken: $accessToken})
          CREATE (entity:Entity {
            name: $name,
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
  const appEvent = req.headers['x-app-audit-event'] || 'unknown-event';
  enqueue(
    req.authz.token,
    async () => {
      const entities = await Entity.findAll();
      const records = entities.map((entity) => entity.dataValues);

      res.json(records);
    },
    exit,
    appEvent,
  );
});

// Get Entity by Id
router.get('/:id', async (req, res, exit) => {
  const { id } = req.params;

  const appEvent = req.headers['x-app-audit-event'] || 'unknown-event';
  enqueue(
    req.authz.token,
    async () => {
      // Validation
      const errors = isRecord(req.params);
      if (errors.length) {
        return exit({ statusCode: 400, message: errors });
      }

      const entity = await Entity.findByPk(id);
      const record = entity && entity.dataValues;

      res.json(record);
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

  const appEvent = req.headers['x-app-audit-event'] || 'unknown-event';
  enqueue(
    req.authz.token,
    async () => {
      // Validation
      const errors = [isEntity(body), isRecord(req.params)].flat();
      if (errors.length) {
        return exit({ statusCode: 400, message: errors });
      }

      const record = await Entity.update(body, {
        fields: ['name'],
        where: { id },
      });

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

  const appEvent = req.headers['x-app-audit-event'] || 'unknown-event';
  enqueue(
    req.authz.token,
    async () => {
      // Validation
      const errors = isRecord(req.params);
      if (errors.length) {
        return exit({ statusCode: 400, message: errors });
      }

      const record = await Entity.destroy({ where: { id } });

      res.json(record);
      return null;
    },
    exit,
    appEvent,
  );
});

export default router;
