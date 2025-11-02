import { Request, Response, Router } from 'express';
import List, { ITask } from '../models/List/list.model';
import { generateKeyBetween } from 'fractional-indexing-jittered';
import multer from 'multer';
import { processExcelFile } from '../utils/excel';

// TODO: tus protocol

class UploadService {
  public router = Router();
  private upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  });

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/preview', this.upload.single('file'), this.previewUpload.bind(this));
    this.router.post('/:listId', this.upload.single('file'), this.uploadToList.bind(this));
    this.router.post('/', this.upload.single('file'), this.handleUpload.bind(this));
  }

  async previewUpload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
      }

      const department = req.headers.department as string;
      const previewData = await processExcelFile(req.file, department);
      res.status(200).json(previewData);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }

  async handleUpload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
      }

      const department = req.headers.department as string;

      const processedData = await processExcelFile(req.file, department);
      const lastList = await List.findOne().sort({ positionKey: -1 });
      let lastPositionKey = lastList?.positionKey || null;

      // Save all processed lists
      for (const listData of processedData) {
        const newPositionKey = generateKeyBetween(lastPositionKey, null);
        lastPositionKey = newPositionKey;

        const list = new List({
          ...listData,
          positionKey: newPositionKey,
        });
        await list.save();
      }

      res.status(201).send();
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }

  async uploadToList(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }
      const listId = req.params.listId;
      const department = req.headers.department as string;
      const targetList = await List.findOne({ _id: listId, department });
      if (!targetList) {
        return res.status(404).send('List not found');
      }
      const processedData = await processExcelFile(req.file, department);
      if (!processedData || !processedData[0] || !processedData[0].tasks) {
        return res.status(400).send('Invalid file format');
      }
      const tasksToAdd = processedData[0].tasks;
      const lastKey = targetList.tasks[targetList.tasks.length - 1]?.positionKey || null;
      let newPositionKey = generateKeyBetween(lastKey, null);
      for (const task of tasksToAdd) {
        task.positionKey = newPositionKey;
        newPositionKey = generateKeyBetween(newPositionKey, null);
      }
      targetList.tasks = [...targetList.tasks, ...(tasksToAdd as ITask[])];
      targetList.markModified('tasks');
      await targetList.save();

      return res.status(201).send();
    } catch (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }
  }
}

const uploadRouter = new UploadService();
export default uploadRouter.router as Router;
