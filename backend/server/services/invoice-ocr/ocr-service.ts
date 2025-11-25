import { Router, Response, Request } from 'express';
import { AuthenticatedRequest, authenticateToken } from 'server/middleware/authenticate';
import { permit, Roles } from 'server/middleware/permit';
import RabbitMQService from '../rabbitmq-service';
import PythonRunnerService from '../python-runner-service';
import OCRJob, { JOB_STATUS } from 'server/models/ocrJob';

class OCRService {
  public router = Router();
  private pythonRunner: PythonRunnerService;
  
  constructor() {
    this.pythonRunner = new PythonRunnerService();
    this.initializeRoutes();
  }

  async initialize(): Promise<void> {    
    try {
      const helloOutput = await this.pythonRunner.runOcrPythonScript('hello.py', '');
      console.log('!!! Python environment:', helloOutput.trim());
    } catch (error: any) {
      console.error('!!! Python environment test failed:', error.message);
      throw new Error(`Python environment not working: ${error.message}`);
    }
    
  }

  private initializeRoutes() {
    this.router.post('/process', authenticateToken, permit(Roles.ADMIN), this.processOCR.bind(this));
    this.router.post('/test', this.testOCR.bind(this));
    this.router.get('/unfinished-jobs', authenticateToken, permit(Roles.ADMIN), this.getUnfinishedJobs.bind(this));
  }

  private async processOCR(req: AuthenticatedRequest, res: Response) {
    try {
      const { imagePath } = req.body;
      if (!imagePath || typeof imagePath !== 'string') {
        return res.status(400).json({ error: 'imagePath is required and must be a string' });
      }

      console.log(`📄 Processing OCR request for: ${imagePath}`);

      const result = await this.pythonRunner.runOcrPythonScript('simple_test.py', '');

      return res.status(200).json({
        success: true,
        imagePath,
        result,
      });
    } catch (error: any) {
      console.error('OCR Service Error:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  private async testOCR(_req: Request, res: Response) {
    try {
      console.log('🧪 Running OCR test...');
      const rabbitMQ = RabbitMQService.getInstance();
      await rabbitMQ.publishToQueue(rabbitMQ.INVOICE_OCR_QUEUE,{})

      return res.status(202).json({
        success: true,
      });
    } catch (error: any) {
      console.error('OCR Test Error:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  private async getUnfinishedJobs(_req: Request, res: Response){
    const jobs = await OCRJob.find({ jobStatus: {$ne: JOB_STATUS.Completed} }).lean();
    return res.json(jobs);
  }

  async shutdown(): Promise<void> {
    console.log('🛑OCR Service shutdown');
  }
}

export default new OCRService();
