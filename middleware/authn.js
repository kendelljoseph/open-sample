import jwt from 'jsonwebtoken';

import Neo4jDatabaseConnection from '../database/neo4j.js';
import { Authn, User } from '../models/record/index.js';
import validation from '../controllers/validation.js';
import enqueue from '../lib/enqueue.js';

const { isKey } = validation;

export default () => async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  // Validation
  const errors = isKey(token);
  if (errors.length) {
    return next({ statusCode: 401, message: errors });
  }

  enqueue(
    token,
    async () => {
      const authnRecord = await Authn.findOne({ where: { accessToken: token } });

      if (authnRecord === null) {
        return next({ statusCode: 401, message: 'Unauthorized' });
      }

      const authn = authnRecord.dataValues;

      const userRecord = await User.findOne({ where: { googleId: authn.googleId } });

      const user = userRecord.dataValues;

      // Graph
      const graph = new Neo4jDatabaseConnection();
      const graphErr = await graph.write(
        `
        MERGE (email:Email {address: $email})
        MERGE (user:User {googleId: $googleId, displayName: $displayName})
        MERGE (authn:Authn {accessToken: $accessToken})
        MERGE (email)-[:BELONGS_TO]->(user)
        MERGE (user)-[:USING_AUTHN_METHOD]->(authn)
    `,
        {
          email: user.email,
          displayName: user.displayName,
          accessToken: authn.accessToken,
          googleId: authn.googleId,
        },
      );

      await graph.disconnect();

      if (graphErr) {
        return next({ statusCode: 400, message: graphErr });
      }

      res.set('x-app-auth-token', token);
      req.authz = { token };
      req.authn = authn;
      req.user = user;
      next();

      return null;
    },
    next,
    '(🔑)',
  );

  return null;
};
