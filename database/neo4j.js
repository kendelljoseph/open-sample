import neo4j from 'neo4j-driver';
import { NEO4J } from '../config/index.js';

export default class Neo4jDatabaseConnection {
  constructor() {
    this.driver = neo4j.driver(
      NEO4J.NEO4J_URI,
      neo4j.auth.basic(NEO4J.NEO4J_USER, NEO4J.NEO4J_PASSWORD),
    );
  }

  async disconnect() {
    return this.driver.close();
  }

  async write(query, variables) {
    const session = this.driver.session({ database: 'neo4j' });

    let err = null;
    try {
      await session.executeWrite((tx) => tx.run(query, variables));
    } catch (error) {
      err = error;
    } finally {
      await session.close();
    }

    return err;
  }
}
