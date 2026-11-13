import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectDB(uri = config.mongoUri) {
  try {
    const conn = await mongoose.connect(uri);
    // Do not log credentials, just host and db name
    const host = conn.connection.host;
    const name = conn.connection.name;
    console.log(`[DB] Connected to MongoDB host: ${host}, database: ${name}`);
    return conn;
  } catch (error) {
    console.error('[DB] Connection error:', error.message);
    throw error;
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
