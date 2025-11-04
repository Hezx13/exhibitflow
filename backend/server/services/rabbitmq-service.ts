import amqp from 'amqplib/callback_api';
import { promisify } from 'util';

type Connection = any;
type Channel = any;

export class RabbitMQService {
  private static instance: RabbitMQService;
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly url: string;
  
  public readonly REPORT_QUEUE = 'report_generation_queue';
  public readonly REPORT_NOTIFICATION_QUEUE = 'report_notification_queue';

  private constructor() {
    this.url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  }

  public static getInstance(): RabbitMQService {
    if (!RabbitMQService.instance) {
      RabbitMQService.instance = new RabbitMQService();
    }
    return RabbitMQService.instance;
  }

  async connect(): Promise<void> {
    try {
      const connectPromise = promisify<string, Connection>(amqp.connect);
      this.connection = await connectPromise(this.url);
      
      const createChannelPromise = promisify<Channel>(this.connection.createChannel.bind(this.connection));
      this.channel = await createChannelPromise();
      
      const assertQueuePromise = promisify(this.channel.assertQueue.bind(this.channel));
      
      // Assert queues exist
      await assertQueuePromise(this.REPORT_QUEUE, { durable: true });
      await assertQueuePromise(this.REPORT_NOTIFICATION_QUEUE, { durable: true });
      
      console.log('✅ RabbitMQ connected successfully');
      
      // Handle connection errors
      this.connection.on('error', (err: Error) => {
        console.error('RabbitMQ connection error:', err);
      });
      
      this.connection.on('close', () => {
        console.log('RabbitMQ connection closed');
      });
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async publishToQueue(queue: string, message: any): Promise<boolean> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    try {
      const sent = this.channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
      return sent;
    } catch (error) {
      console.error('Failed to publish message to queue:', error);
      throw error;
    }
  }

  async consumeQueue(
    queue: string,
    callback: (message: any) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const consumePromise = promisify(this.channel.consume.bind(this.channel));
    
    await consumePromise(
      queue,
      async (msg: any) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            await callback(content);
            this.channel!.ack(msg);
          } catch (error) {
            console.error('Error processing message:', error);
            // Reject and requeue the message
            this.channel!.nack(msg, false, true);
          }
        }
      },
      { noAck: false }
    );
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        const closeChannelPromise = promisify(this.channel.close.bind(this.channel));
        await closeChannelPromise();
      }
      if (this.connection) {
        const closeConnectionPromise = promisify(this.connection.close.bind(this.connection));
        await closeConnectionPromise();
      }
      console.log('RabbitMQ connection closed');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }

  getChannel(): Channel | null {
    return this.channel;
  }
}

export default RabbitMQService;
