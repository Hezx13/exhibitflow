import { Router, Response, Request } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { AuthenticatedRequest, authenticateToken } from 'server/middleware/authenticate';
import { permit, Roles } from 'server/middleware/permit';
import RabbitMQService from '../rabbitmq-service';

class OCRService {
  public router = Router();
  private pyServerPath: string;
  private pythonExecutable: string;

  constructor() {
    this.pyServerPath = path.join(__dirname, '../../../py-server');
    this.pythonExecutable = path.join(this.pyServerPath, '.venv', 'bin', 'python3');
    this.initializeRoutes();
  }

  async initialize(): Promise<void> {    
    try {
      const helloOutput = await this.runOcrPythonScript('hello.py');
      console.log('!!! Python environment:', helloOutput.trim());
    } catch (error: any) {
      console.error('!!! Python environment test failed:', error.message);
      throw new Error(`Python environment not working: ${error.message}`);
    }
    
  }

  private initializeRoutes() {
    this.router.post('/process', authenticateToken, permit(Roles.ADMIN), this.processOCR.bind(this));
    this.router.get('/test', this.testOCR.bind(this));
  }
  // todo: remove this
  public runOcrPythonScript (scriptName: string = 'simple_test.py'): Promise<string> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.pythonExecutable, [scriptName], {
        cwd: this.pyServerPath,
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Process exited with code ${code}: ${stderr}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(error);
      });

      const timeout = setTimeout(() => {
        pythonProcess.kill();
        reject(new Error('Process timeout after 120 seconds'));
      }, 120000);

      pythonProcess.on('close', () => clearTimeout(timeout));
    });
  }

  private async processOCR(req: AuthenticatedRequest, res: Response) {
    try {
      const { imagePath } = req.body;
      if (!imagePath || typeof imagePath !== 'string') {
        return res.status(400).json({ error: 'imagePath is required and must be a string' });
      }

      console.log(`📄 Processing OCR request for: ${imagePath}`);

      const result = await this.runOcrPythonScript();

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

  async shutdown(): Promise<void> {
    console.log('🛑 OCR Service shutdown');
  }
}

export default new OCRService();
