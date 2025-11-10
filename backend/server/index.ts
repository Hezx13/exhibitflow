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
import { RabbitMQService } from './services/rabbitmq-service';
import ReportWorker from './workers/report-worker';
import NotificationService from './services/notification-service';
import ocrService from './services/invoice-ocr/ocr-service';
import OcrWorker from './workers/ocr-worker';

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
app.use('/api/ocr', ocrService.router);
app.use(errorHandler);

const server = createServer(app);

const hocuspocusService = new HocuspocusService();

const notificationService = NotificationService.getInstance();
notificationService.initialize(server);

// This MUST be registered AFTER Socket.IO initialization to override its handler
server.removeAllListeners('upgrade'); // Remove Socket.IO's auto-registered handler
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
    
  // Route to Hocuspocus for /hocuspocus path
  if (pathname === '/hocuspocus') {
    console.log('-→ Routing to Hocuspocus');
    hocuspocusService.handleUpgrade(request, socket, head);
    return;
  }
  
  // Route to Socket.IO for /notifications/* paths
  if (pathname.startsWith('/notifications')) {
    console.log('-→ Routing to Socket.IO');
    const io = notificationService.getIO();
    if (io) {
      // @ts-expect-error - accessing internal engine
      io.engine.handleUpgrade(request, socket, head);
    }
    return;
  }
  
  console.log('→ No handler for this path, destroying socket');
  socket.destroy();
});

app.use('/api/documents/:documentId', (req, res, next) =>
  documentMiddleware(req, res, next, hocuspocusService.hocuspocusServer)
);

const startServer = async () => {
  try {
    await connectDB();
    
    await ocrService.initialize();
    
    const rabbitMQ = RabbitMQService.getInstance();
    await rabbitMQ.connect();
    
    const reportWorker = new ReportWorker();
    await reportWorker.start();

    const ocrWorker = new OcrWorker();
    await ocrWorker.start();
    
    await notificationService.startNotificationListener();
    
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
