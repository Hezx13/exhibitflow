import { RabbitMQService } from '../services/rabbitmq-service';
import List from '../models/List/list.model';
import { Report } from '../models/reports';
import { generateReport, Period } from '../utils/report-utils';

export interface ReportGenerationJob {
  periodStart: string;
  periodEnd: string;
  payment: string;
  department: string;
  userId?: string;
}

export interface ReportNotification {
  status: 'success' | 'error';
  reportId?: string;
  message: string;
  department: string;
  userId?: string;
  period: {
    start: string;
    end: string;
  };
  payment: string;
}
//todo: add logs
export class ReportWorker {
  private rabbitMQ: RabbitMQService;

  constructor() {
    this.rabbitMQ = RabbitMQService.getInstance();
  }

  async start(): Promise<void> {
    
    await this.rabbitMQ.consumeQueue(
      this.rabbitMQ.REPORT_QUEUE,
      this.processReportGeneration.bind(this)
    );
    
    console.log('\x1b[32m%s\x1b[0m','Report worker started and listening for jobs');
  }

  private async processReportGeneration(job: ReportGenerationJob): Promise<void> {
    console.log('📊 Processing report generation job:', job);
    
    const { periodStart, periodEnd, payment, department, userId } = job;

    try {
      // Delete existing report if any
      await Report.findOneAndDelete({
        'month.start': periodStart,
        payment: payment,
      });
      
      const period = new Period(periodStart, periodEnd);
      const startDate = new Date(periodStart);
      const endDate = new Date(periodEnd);
      
      console.log('📅 Period start:', startDate);
      console.log('📅 Period end:', endDate);
      
      const fetchedLists = await List.find({
        department: department,
        'tasks.deliveryDate': {
          $gte: startDate,
          $lte: endDate,
        },
      });

      const report = await generateReport(period, fetchedLists, payment, department);
      console.log('Report generated - Active Projects:', report.activeProjects.length);
      console.log('Materials count:', report.materials.length);
      
      let reportId: string | undefined;
      
      if (report?.materials.length) {
        const dbReport = new Report(report);
        const savedReport = await dbReport.save();
        reportId = savedReport._id.toString();
      }

      // Send success notification
      const notification: ReportNotification = {
        status: 'success',
        reportId,
        message: report?.materials.length 
          ? 'Report generated successfully' 
          : 'Report generated but no materials found',
        department,
        userId,
        period: {
          start: periodStart,
          end: periodEnd,
        },
        payment,
      };

      await this.rabbitMQ.publishToQueue(
        this.rabbitMQ.REPORT_NOTIFICATION_QUEUE,
        notification
      );
      
      console.log('\x1b[32m%s\x1b[0m', 'Report generation completed and notification sent');
    } catch (error: any) {
      console.error(error);
      
      const notification: ReportNotification = {
        status: 'error',
        message: error.message || 'Failed to generate report',
        department,
        userId,
        period: {
          start: periodStart,
          end: periodEnd,
        },
        payment,
      };

      await this.rabbitMQ.publishToQueue(
        this.rabbitMQ.REPORT_NOTIFICATION_QUEUE,
        notification
      );
    }
  }
}

export default ReportWorker;
