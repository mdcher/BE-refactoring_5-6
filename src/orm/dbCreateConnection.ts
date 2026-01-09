import { Connection, createConnection, getConnectionManager } from 'typeorm';

import config from './config/ormconfig';

export const dbCreateConnection = async (): Promise<Connection> => {
  try {
    const conn = await createConnection(config);
    console.log(`Database connection success. Connection name: '${conn.name}' Database: '${conn.options.database}'`);
    return conn;
  } catch (err) {
    if (err.name === 'AlreadyHasActiveConnectionError') {
      const activeConnection = getConnectionManager().get(config.name);
      console.log(`Using existing database connection: '${activeConnection.name}'`);
      return activeConnection;
    }
    console.error('❌ Database connection failed:');
    console.error(err);
    throw err;
  }
};
