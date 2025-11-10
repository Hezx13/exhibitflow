import OCRJob from "server/models/ocrJob";
import PythonRunnerService from "server/services/python-runner-service";
import RabbitMQService from "server/services/rabbitmq-service";

class OcrWorker {
    private rabbitMQ: RabbitMQService;
    private pythonRunner: PythonRunnerService;

    constructor() {
        this.rabbitMQ = RabbitMQService.getInstance();
        this.pythonRunner = new PythonRunnerService();
    }

    async start(): Promise<void> {
        try {
            return await this.rabbitMQ.consumeQueue(
                this.rabbitMQ.INVOICE_OCR_QUEUE,
                this.processOcrJob.bind(this)
            );
        } catch (error) {
            console.error('Failed to start OCR worker:', error);
            return Promise.reject(error);
        }
    }
    private async processOcrJob(_job: any): Promise<void> {
        console.log('Processing OCR job...');

        try {
            const newJobEntry = new OCRJob()
            await newJobEntry.save();
            const result = await this.pythonRunner.runOcrPythonScript('simple_test.py', newJobEntry._id.toString());
            console.log('OCR job completed successfully:', result);
        } catch (error) {
            console.error('Error processing OCR job:', error);
        }
    }

}

export default OcrWorker;