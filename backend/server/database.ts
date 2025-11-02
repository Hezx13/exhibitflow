import mongoose from 'mongoose';
import { config } from './config';

export const connectDB = async (): Promise<void> => {
  try {
    console.log(`[DEBUG] Attempting to connect to MongoDB at: ${config.mongodb.uri}`);
    await mongoose.connect(config.mongodb.uri, {
      dbName: config.mongodb.dbName,
    });
    console.log('[DEBUG] Successfully connected to MongoDB');

    // Log additional connection info
    const connectionState = mongoose.connection.readyState;
    const stateMap: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    console.log(
      `[DEBUG] MongoDB connection state: ${stateMap[connectionState] || connectionState}`
    );
  } catch (error) {
    console.error('[DEBUG] MongoDB connection error:', error);
    throw error;
  }
};

// Set up additional connection event listeners
mongoose.connection.on('connected', () => {
  console.log('[DEBUG] MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  console.log('[DEBUG] MongoDB connection disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('[DEBUG] MongoDB connection error:', error);
});

// Log all saved documents (useful for debugging)
mongoose.set('debug', true);
