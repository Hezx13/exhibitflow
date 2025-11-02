import { Router } from 'express';
import type { Request, Response } from 'express';
import { Log } from '../models/log';
import { authenticateToken } from 'server/middleware/authenticate';
import { permit, Roles } from 'server/middleware/permit';

class LogsService {
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      '/',
      authenticateToken,
      permit(Roles.ADMIN),
      this.getLogs.bind(this)
    );
    this.router.get(
      '/:logId',
      authenticateToken,
      permit(Roles.ADMIN),
      this.getLogById.bind(this)
    );
    this.router.delete(
      '/:logId',
      authenticateToken,
      permit(Roles.ADMIN),
      this.deleteLog.bind(this)
    );
    this.router.delete(
      '/',
      authenticateToken,
      permit(Roles.ADMIN),
      this.deleteLogs.bind(this)
    );
    this.router.get(
      '/user/:userId',
      authenticateToken,
      permit(Roles.MANAGER),
      this.getLogsByUser.bind(this)
    );
    this.router.get(
      '/endpoint/:endpoint',
      authenticateToken,
      permit(Roles.ADMIN),
      this.getLogsByEndpoint.bind(this)
    );
  }

  async getLogs(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        method,
        endpoint,
        userId,
        status,
        startDate,
        endDate,
        sortBy = 'timestamp',
        sortOrder = 'desc'
      } = req.query;

      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);
      const skip = (pageNumber - 1) * limitNumber;

      // Build filter object
      const filter: any = {};

      if (method) {
        filter.method = method;
      }

      if (endpoint) {
        filter.endpoint = { $regex: endpoint, $options: 'i' };
      }

      if (userId) {
        filter.userId = userId;
      }

      if (status) {
        if (status === '2xx') {
          filter.responseStatus = { $gte: 200, $lt: 300 };
        } else if (status === '3xx') {
          filter.responseStatus = { $gte: 300, $lt: 400 };
        } else if (status === '4xx') {
          filter.responseStatus = { $gte: 400, $lt: 500 };
        } else if (status === '5xx') {
          filter.responseStatus = { $gte: 500, $lt: 600 };
        } else {
          filter.responseStatus = parseInt(status as string);
        }
      }

      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) {
          filter.timestamp.$gte = new Date(startDate as string);
        }
        if (endDate) {
          filter.timestamp.$lte = new Date(endDate as string);
        }
      }

      // Build sort object
      const sortObj: any = {};
      sortObj[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      const [logs, total] = await Promise.all([
        Log.find(filter)
          .sort(sortObj)
          .skip(skip)
          .populate('userId')
          .limit(limitNumber)
          .lean(),
        Log.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / limitNumber);

      res.status(200).json({
        logs,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalLogs: total,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getLogById(req: Request, res: Response) {
    try {
      const { logId } = req.params;

      const log = await Log.findById(logId);
      if (!log) {
        return res.status(404).json({ message: 'Log not found' });
      }

      res.status(200).json(log);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getLogsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        sortBy = 'timestamp',
        sortOrder = 'desc'
      } = req.query;

      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);
      const skip = (pageNumber - 1) * limitNumber;

      const filter: any = { userId };

      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) {
          filter.timestamp.$gte = new Date(startDate as string);
        }
        if (endDate) {
          filter.timestamp.$lte = new Date(endDate as string);
        }
      }

      const sortObj: any = {};
      sortObj[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      const [logs, total] = await Promise.all([
        Log.find(filter)
          .sort(sortObj)
          .skip(skip)
          .limit(limitNumber)
          .lean(),
        Log.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / limitNumber);

      res.status(200).json({
        logs,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalLogs: total,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getLogsByEndpoint(req: Request, res: Response) {
    try {
      const { endpoint } = req.params;
      const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        sortBy = 'timestamp',
        sortOrder = 'desc'
      } = req.query;

      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);
      const skip = (pageNumber - 1) * limitNumber;

      const filter: any = { 
        endpoint: { $regex: decodeURIComponent(endpoint as string), $options: 'i' }
      };

      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) {
          filter.timestamp.$gte = new Date(startDate as string);
        }
        if (endDate) {
          filter.timestamp.$lte = new Date(endDate as string);
        }
      }

      const sortObj: any = {};
      sortObj[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      const [logs, total] = await Promise.all([
        Log.find(filter)
          .sort(sortObj)
          .skip(skip)
          .limit(limitNumber)
          .lean(),
        Log.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / limitNumber);

      res.status(200).json({
        logs,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalLogs: total,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteLog(req: Request, res: Response) {
    try {
      const { logId } = req.params;

      const result = await Log.findByIdAndDelete(logId);
      if (!result) {
        return res.status(404).json({ message: 'Log not found' });
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteLogs(req: Request, res: Response) {
    try {
      const { logIds, filter } = req.body;

      let deleteFilter: any = {};

      if (logIds && Array.isArray(logIds)) {
        deleteFilter._id = { $in: logIds };
      } else if (filter) {
        // Allow deletion by filter criteria
        if (filter.startDate || filter.endDate) {
          deleteFilter.timestamp = {};
          if (filter.startDate) {
            deleteFilter.timestamp.$gte = new Date(filter.startDate);
          }
          if (filter.endDate) {
            deleteFilter.timestamp.$lte = new Date(filter.endDate);
          }
        }
        if (filter.method) {
          deleteFilter.method = filter.method;
        }
        if (filter.userId) {
          deleteFilter.userId = filter.userId;
        }
        if (filter.endpoint) {
          deleteFilter.endpoint = { $regex: filter.endpoint, $options: 'i' };
        }
      } else {
        return res.status(400).json({ message: 'Either logIds or filter criteria are required' });
      }

      const result = await Log.deleteMany(deleteFilter);

      res.status(200).json({
        message: `${result.deletedCount} logs deleted successfully`,
        deletedCount: result.deletedCount
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

const logsRouter = new LogsService();
export default logsRouter.router as Router; 