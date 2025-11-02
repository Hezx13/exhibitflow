import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 4500,
  ip: process.env.IP?.toString() || '0.0.0.0',
  cors: {
    origin: JSON.parse(process.env.CORS || '["http://localhost:3000"]'),
    credentials: true,
  },
  mongodb: {
    uri: process.env.CLOUD_DB_URI || 'mongodb://127.0.0.1:27017',
    dbName: 'test',
  },
  jwt: {
    secret: process.env.JWT_SECRET_KEY || 'fallbackSecret',
  },
} as const;
