const local = require('./local');
const postgres = require('./postgres');
const neo4j = require('./neo4j');

module.exports = { local, postgres, neo4j };
