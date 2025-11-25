import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: Number(process.env.FILE_SERVER_PORT) || 4501,
  ip: process.env.IP?.toString() || '0.0.0.0',
  cors: {
    origin: JSON.parse(process.env.CORS || '["http://localhost:3000"]'),
    credentials: true,
  },
  mongodb: {
    uri: process.env.CLOUD_DB_URI || 'mongodb://127.0.0.1:27017',
    dbName: 'test',
  },
  storage: {
    path: process.env.FILE_STORAGE_PATH || path.join(__dirname, 'uploads'),
  },
} as const;
