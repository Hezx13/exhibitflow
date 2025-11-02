import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config';
import { connectDB } from './database';
import { errorHandler } from './middleware/errorHandler';
import listRoutes from './services/list-service';
import reportRoutes from './routes/reportRoutes';
import { router as materialRoutes } from './routes/materialRoutes';
import { router as projectRoutes } from './routes/projectRoutes';
import uploadRoutes from './services/upload-service';
import taskRoutes from './services/task-service';
import searchRoutes from './services/search-service';
import { createServer } from 'http';
import statisticsRoutes from './services/statistics-service';
import authNService from './services/authn-service';
import authZService from './services/authz-service';
import balanceRoutes from './services/balance-service';
import documentMiddleware from './middleware/document';
import HocuspocusService from './services/hocuspocus-service';
import documentService from './services/document/document-service';
import libraryService from './services/library-service';
import departmentService from './services/departments-service';
import logsRouter from './services/logs-service';
import { ProvisioningService } from './services/provisioning-service';

const app: Application = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/lists', [listRoutes, taskRoutes]);
app.use('/api/upload', uploadRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/authn', authNService);
app.use('/api/authz', authZService);
app.use('/api/balance', balanceRoutes);
app.use('/api/documents', documentService);
app.use('/api/library', libraryService);
app.use('/api/departments', departmentService);
app.use('/api/logs', logsRouter);
// Error handling
app.use(errorHandler);

// Server setup
const server = createServer(app);
const hocuspocusService = new HocuspocusService(server);
app.use('/api/documents/:documentId', (req, res, next) =>
  documentMiddleware(req, res, next, hocuspocusService.hocuspocusServer)
);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    // Check and provision default setup if database is empty
    await ProvisioningService.checkAndProvision();
    
    server.listen(config.port, config.ip, () => {
      console.log(`Server running on ${config.ip}:${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
