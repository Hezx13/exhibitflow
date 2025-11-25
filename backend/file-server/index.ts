import express from 'express';
import cors from 'cors';
import { config } from './config';
import { connectDB } from './database';
import routes from './routes';

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(config.port, config.ip, () => {
      console.log(`[FileServer] Server running at http://${config.ip}:${config.port}`);
    });
  } catch (error) {
    console.error('[FileServer] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
