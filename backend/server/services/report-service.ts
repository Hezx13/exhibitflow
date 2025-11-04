import { Request, Response, Router } from 'express';
import { AppError } from 'server/utils/errors';
import { Report } from 'server/models/reports';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from 'server/middleware/authenticate';
import { permit, Roles } from 'server/middleware/permit';
import verifyDepartment from 'server/middleware/department';
import { RabbitMQService } from './rabbitmq-service';
import { ReportGenerationJob } from '../workers/report-worker';

class ReportService {
  public router = Router();

  constructor() {
    this.initializeRoutes();
    this.router.use(verifyDepartment);
  }

  private initializeRoutes() {
    this.router.post('/generate', authenticateToken,verifyDepartment, permit(Roles.MANAGER), this.generateReport.bind(this));
    this.router.get('/', authenticateToken, permit(Roles.USER), this.getReports.bind(this));
    this.router.get('/:id', authenticateToken, permit(Roles.MANAGER), this.getReportDetails.bind(this));
    this.router.post('/debit', authenticateToken, permit(Roles.MANAGER), this.addDebit.bind(this));
    this.router.get('/download', authenticateToken, permit(Roles.USER), this.downloadReport.bind(this));
  }

  async generateReport(req: Request, res: Response) {
    try {
      const { periodStart, periodEnd, payment } = req.body;
      const department = req.headers.department as string;
      const userId = (req as any).user?.id;
      
      if (!periodStart || !periodEnd || !payment || !department) {
        throw new AppError(400, 'Missing required parameters');
      }

      const rabbitMQ = RabbitMQService.getInstance();
      
      const job: ReportGenerationJob = {
        periodStart,
        periodEnd,
        payment,
        department,
        userId,
      };

      await rabbitMQ.publishToQueue(rabbitMQ.REPORT_QUEUE, job);
      
      res.status(202).json({ 
        message: 'Report generation started. You will be notified when it is ready.',
        status: 'processing'
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getReports(req: Request, res: Response) {
    try {
      const { department } = req.headers;

      if (!department) {
        throw new AppError(400, 'Department is required');
      }

      const reports = await Report.find({ department: department }).lean();
      res.json({ reports: reports.map((report) => ({...report,materials: report.materials.length})) });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
  
  async getReportDetails(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const report = await Report.findById(id).lean();

      if (!report) {
        throw new AppError(404, 'Report not found');
      }
      
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async addDebit(req: Request, res: Response) {
    try {
      const { periodStart, valueToInsert, pay, department } = req.body;

      if (!periodStart || !valueToInsert || !pay || !department) {
        throw new AppError(400, 'Missing required parameters');
      }

      const result = await Report.updateOne(
        {
          'month.start': periodStart,
          payment: pay,
          department: department,
        },
        { $push: { debit: valueToInsert } }
      );

      if (!result.matchedCount) {
        throw new AppError(404, 'Report not found');
      }

      res.status(200).json({ message: 'Successfully updated report' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }


  async downloadReport(req: Request, res: Response) {
    try {
      const { department } = req.headers;
      const { id } = req.query;
      if (!id || !department) {
        throw new AppError(400, 'Missing required parameters');
      }

      const report = await Report.findById(id).lean();

      if (!report) {
        throw new AppError(404, 'Report not found');
      }

      const wb = XLSX.utils.book_new();

      // All materials sheet
      const allMaterials = [
        ['Date', 'Project', 'Invoice', 'Description', 'Credit'],
        ...report.materials.map((material) => [
          material.date,
          material.listParent?.name,
          material.comment,
          material.name,
          material.price,
        ]),
      ];
      const wsAll = XLSX.utils.aoa_to_sheet(allMaterials);
      XLSX.utils.book_append_sheet(wb, wsAll, 'All Materials');

      // Debits sheet
      const allDebits = [
        ['Date', 'Amount', 'Cheque number'],
        ...report.debit.map((debit) => [debit.date, debit.debit, debit.description]),
      ];
      const wsDeb = XLSX.utils.aoa_to_sheet(allDebits);
      XLSX.utils.book_append_sheet(wb, wsDeb, 'Debits');

      // Project-specific sheets
      const projectMap = new Map<string, any[]>();
      for (const material of report.materials) {
        const projectId = material.listParent?.name;
        if (!projectId) continue;
        if (!projectMap.has(projectId)) {
          projectMap.set(projectId, []);
        }
        projectMap
          .get(projectId)
          ?.push([
            material.date,
            material.listParent?.name,
            material.comment,
            material.name,
            Number(material.price || 0) * (material.quantity || 0),
          ]);
      }

      for (const [projectId, materials] of projectMap) {
        const ws = XLSX.utils.aoa_to_sheet([
          ['Date', 'Project', 'Invoice', 'Description', 'Credit'],
          ...materials,
        ]);
        XLSX.utils.book_append_sheet(wb, ws, projectId);
      }

      const fileName = 'ExportedReports.xlsx';
      const filePath = path.join(__dirname, '..', '..', 'temp', fileName);

      // Ensure temp directory exists
      const tempDir = path.dirname(filePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      XLSX.writeFile(wb, filePath);

      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('File download failed:', err);
          throw new AppError(500, 'Download failed');
        }
        // Clean up file after download
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Could not remove temporary file:', unlinkErr);
          }
        });
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

const reportRouter = new ReportService();
export default reportRouter.router as Router; 