import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { RabbitMQService } from './rabbitmq-service';
import { ReportNotification } from '../workers/report-worker';

export class NotificationService {
  private static instance: NotificationService;
  private io: SocketIOServer | null = null;
  private rabbitMQ: RabbitMQService;

  private constructor() {
    this.rabbitMQ = RabbitMQService.getInstance();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: JSON.parse(process.env.CORS || '["http://localhost:3000"]'),
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: '/notifications',
      transports: ['websocket', 'polling'],
      // Important: allow upgrades to pass through
      allowUpgrades: true,
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected to notifications:', socket.id);

      socket.on('join-department', (department: string) => {
        socket.join(`department:${department}`);
        console.log(`User ${socket.id} joined department room: ${department}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected from notifications:', socket.id);
      });
    });
    
    console.log('✅ Socket.IO notification service initialized on /notifications');
  }
  
  async startNotificationListener(): Promise<void> {
    
    await this.rabbitMQ.consumeQueue(
      this.rabbitMQ.REPORT_NOTIFICATION_QUEUE,
      this.broadcastReportNotification.bind(this),
    );

    await this.rabbitMQ.consumeQueue(
      this.rabbitMQ.OCR_JOB_NOTIFICATION_QUEUE,
      this.broadcastOcrJobNotification.bind(this),
    );
    
    console.log('\x1b[32m%s\x1b[0m','Notification listener started');
  }

  private async broadcastOcrJobNotification(notification: any): Promise<void> {
    console.log('\x1b[34m%s\x1b[0m', 'Broadcasting notification:', notification);
    if (!this.io) {
      console.error('Socket.IO not initialized');
      return;
    }

    this.io.emit('ocr-job-updated', {
      jobId: notification.jobId,
    });
  }

  private async broadcastReportNotification(notification: ReportNotification): Promise<void> {
    console.log('\x1b[34m%s\x1b[0m', 'Broadcasting notification:', notification);

    if (!this.io) {
      console.error('Socket.IO not initialized');
      return;
    }

    this.io.to(`department:${notification.department}`).emit('report-ready', {
      status: notification.status,
      reportId: notification.reportId,
      message: notification.message,
      period: notification.period,
      payment: notification.payment,
      timestamp: new Date().toISOString(),
    });

  }

  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export default NotificationService;
