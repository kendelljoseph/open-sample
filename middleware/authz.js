import randomName from 'node-random-name';
import jwt from 'jsonwebtoken';

import Neo4jDatabaseConnection from '../database/neo4j.js';
import { Authz } from '../models/record/index.js';
import validation from '../controllers/validation.js';
import enqueue from './lib/enqueue.js';

const { isKey } = validation;

export default () => async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const key = authHeader && authHeader.split(' ')[1];
  if (!key) return res.sendStatus(401);

  // Validation
  const errors = isKey(key);
  if (errors.length) {
    return next({ statusCode: 401, message: errors });
  }

  const token = jwt.sign({ key }, process.env.ACCESS_TOKEN_SECRET);

  enqueue(
    token,
    async () => {
      const [record, created] = await Authz.findOrCreate({
        where: { token },
      });

      const authz = { key, ...record.dataValues };
      const authzName = randomName({ seed: token });

      // Graph
      const graph = new Neo4jDatabaseConnection();
      const graphErr = await graph.write(
        `
      MERGE (authKey:AuthKey {key: $key})
      MERGE (authz:Authz {token: $token, name: $authzName})
    `,
        {
          authzName,
          token: authz.token,
          key: authz.key,
        },
      );

      const graphErr2 = await graph.write(
        `
      MATCH (authKey:AuthKey {key: $key})
      MATCH (authz:Authz {token: $token})
      MERGE (authz)-[:USING_KEY]->(authKey)
    `,
        {
          token: authz.token,
          key: authz.key,
        },
      );
      await graph.disconnect();

      if (graphErr || graphErr2) {
        return next({ statusCode: 400, message: [graphErr, graphErr2] });
      }

      await jwt.verify(authz.token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        res.set('x-app-auth-token', authz.token);
        req.authz = authz;
        req.authzName = authzName;
        req.user = user;
        next();
        return null;
      });

      if (created) {
        // eslint-disable-next-line no-console
        console.info('🌱:', token);
      }
      return null;
    },
    next,
    '(🔑)',
  );

  return null;
};
