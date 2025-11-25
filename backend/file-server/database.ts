import mongoose from 'mongoose';
import { config } from './config';

export const connectDB = async (): Promise<void> => {
  try {
    console.log(`[FileServer] Attempting to connect to MongoDB at: ${config.mongodb.uri}`);
    await mongoose.connect(config.mongodb.uri, {
      dbName: config.mongodb.dbName,
    });
    console.log('[FileServer] Successfully connected to MongoDB');
  } catch (error) {
    console.error('[FileServer] MongoDB connection error:', error);
    process.exit(1);
  }
};
