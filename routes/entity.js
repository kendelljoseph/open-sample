import express from 'express';

import Neo4jDatabaseConnection from '../database/neo4j.js';
import { Entity } from '../models/record/index.js';
import validation from '../controllers/validation.js';

const router = express.Router();

const { isEntity, isRecord } = validation;

// Create Entity
router.post('/', async (req, res, exit) => {
  const { body } = req;

  // Validation
  const errors = isEntity(body);
  if (errors.length) {
    return exit({ statusCode: 400, message: errors });
  }

  // Model
  const entity = await Entity.create(body, {
    fields: ['name'],
  });

  const record = entity.dataValues;

  // Graph
  const graph = new Neo4jDatabaseConnection();
  const graphErr = await graph.write(
    `
    MATCH (authz:Authz {token: $token})
    CREATE (entity:Entity {
      name: $name,
      createdAt: timestamp(),
      updatedAt: timestamp()
    })
    
    MERGE (entity)-[:USING_AUTHZ]->(authz)
    `,
    {
      token: req.authz && req.authz.token,
      key: req.authz && req.authz.key,
      ...record,
    },
  );
  await graph.disconnect();

  if (graphErr) {
    return exit({ statusCode: 400, message: graphErr });
  }

  // Respond
  res.json(record);
  return null;
});

// Get All Entities
router.get('/', async (req, res) => {
  // Model
  const entities = await Entity.findAll();
  const records = entities.map((entity) => entity.dataValues);

  res.json(records);
});

// Get Entity by Id
router.get('/:id', async (req, res, exit) => {
  const { id } = req.params;

  // Validation
  const errors = isRecord(req.params);
  if (errors.length) {
    return exit({ statusCode: 400, message: errors });
  }

  // Model
  const entity = await Entity.findByPk(id);
  const record = entity && entity.dataValues;

  // Respond
  res.json(record);
  return null;
});

// Update an Entity by Id
router.put('/:id', async (req, res, exit) => {
  const { id } = req.params;
  const { body } = req;

  // Validation
  const errors = [isEntity(body), isRecord(req.params)].flat();
  if (errors.length) {
    return exit({ statusCode: 400, message: errors });
  }

  // Model
  const record = await Entity.update(body, {
    fields: ['name'],
    where: { id },
  });

  // Respond
  res.json(record);
  return null;
});

// Delete an Entity by Id
router.delete('/:id', async (req, res, exit) => {
  const { id } = req.params;

  // Validation
  const errors = isRecord(req.params);
  if (errors.length) {
    return exit({ statusCode: 400, message: errors });
  }

  const record = await Entity.destroy({ where: { id } });

  // Respond
  res.json(record);
  return null;
});

export default router;
