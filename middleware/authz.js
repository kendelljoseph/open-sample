const randomName = require('node-random-name');
const jwt = require('jsonwebtoken');
const { Neo4jDatabaseConnection } = require('../database/neo4j');
const { Authz } = require('../models');
const { validation } = require('../controllers');

const { isKey } = validation;

module.exports = () => async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const key = authHeader && authHeader.split(' ')[1];
  if (!key) return res.sendStatus(401);

  // Validation
  const errors = isKey(key);
  if (errors.length) {
    return next({ statusCode: 401, message: errors });
  }

  const token = jwt.sign({ key }, process.env.ACCESS_TOKEN_SECRET);
  await Authz.findOrCreate({ where: { key } });
  await Authz.update({ token }, { where: { key } });
  const record = await Authz.findOne({ where: { token } });

  const authz = record.dataValues;
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
  });
};
