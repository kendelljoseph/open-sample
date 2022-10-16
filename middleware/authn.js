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
      const cacheKey = `authn/${token}`;

      const authenticate = async () => {
        if (req.localCache.has(cacheKey)) {
          const cache = req.localCache.get(cacheKey);
          return cache;
        }
        const authnRecord = await Authn.findOne({ where: { accessToken: token } });

        if (authnRecord === null) {
          next({ statusCode: 401, message: 'Unauthorized' });
          return {};
        }

        const authn = authnRecord.dataValues;

        const userRecord = await User.findOne({ where: { googleId: authn.googleId } });

        const user = userRecord.dataValues;
        return { authn, user };
      };

      const { authn, user } = await authenticate();
      if (!authn || !user) return;

      // Graph
      const graph = new Neo4jDatabaseConnection();
      const graphErr = await graph.write(
        `
        MERGE (google:Authority {name:'google'})
        MERGE (email:Email {address: $email})
        MERGE (user:User {displayName: $displayName})
        MERGE (authn:Authn {accessToken: $accessToken})
        MERGE (passport:Passport {accessTokenSecret: $accessTokenSecret})
        
        MERGE (authn)-[:USING_PASSPORT]->(passport)
        MERGE (user)-[:USING_AUTHN_METHOD]->(authn)
        MERGE (user)-[:USING_PASSPORT]->(passport)
        MERGE (user)-[:USING_EMAIL]->(email)
        MERGE (google)-[:AUTHORIZED {googleId: $googleId}]->(user)
    `,
        {
          email: user.email,
          displayName: user.displayName,
          accessToken: authn.accessToken,
          googleId: authn.googleId,
          accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
        },
      );

      await graph.disconnect();

      if (graphErr) {
        next({ statusCode: 400, message: graphErr });
        return;
      }

      res.set('x-app-auth-token', token);
      req.authz = { token };
      req.authn = authn;
      req.user = user;

      req.localCache.set(cacheKey, {
        authn,
        user,
      });
      next();
    },
    next,
    '(🔑)',
  );

  return null;
};
