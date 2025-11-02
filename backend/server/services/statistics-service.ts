import { Request, Response, Router } from 'express';
import List, { Status } from '../models/List/list.model';
import verifyDepartment from 'server/middleware/department';

class StatisticsService {
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/purchases', this.getPurchaseStats.bind(this));
    this.router.use(verifyDepartment);
  }

  async getPurchaseStats(req: Request, res: Response) {
    try {
      const { department } = req.headers;
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Generate array of all dates in the week
      const dates = Array.from({ length: 8 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (7 - i));
        date.setHours(0, 0, 0, 0);
        return date;
      });

      // Build match conditions for purchased items
      const matchCondition: any = {
        tasks: {
          $elemMatch: {
            status: { $in: [Status.DONE, Status.WAITING_FOR_PAYMENT] },
            price: { $ne: null },
            deliveryDate: { $gte: oneWeekAgo },
          },
        },
      };

      if (department) {
        matchCondition.department = department;
      }

      const results = await List.aggregate([
        { $match: matchCondition },
        { $unwind: '$tasks' },
        {
          $match: {
            'tasks.status': { $in: [Status.DONE, Status.WAITING_FOR_PAYMENT] },
            'tasks.price': { $ne: null },
            'tasks.deliveryDate': { $gte: oneWeekAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$tasks.deliveryDate',
              },
            },
            totalAmount: {
              $sum: {
                $multiply: ['$tasks.price', { $ifNull: ['$tasks.quantity', 1] }],
              },
            },
            itemCount: { $sum: 1 },
            averagePrice: { $avg: '$tasks.price' },
            items: {
              $push: {
                name: '$tasks.name',
                price: '$tasks.price',
                quantity: '$tasks.quantity',
                status: '$tasks.status',
                payment: '$tasks.payment',
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Create a map of existing results
      const resultsMap = new Map(results.map((item) => [item._id, item]));

      // Fill in missing dates with zero values
      const dailyStats = dates.map((date) => {
        const dateStr = date.toISOString().split('T')[0];
        return (
          resultsMap.get(dateStr) || {
            _id: dateStr,
            totalAmount: 0,
            itemCount: 0,
            averagePrice: 0,
            items: [],
          }
        );
      });

      // Calculate summary statistics
      const summary = dailyStats.reduce(
        (acc, day) => {
          acc.totalPurchases += day.totalAmount;
          acc.totalItems += day.itemCount;
          return acc;
        },
        {
          totalPurchases: 0,
          totalItems: 0,
          averageDailySpend: 0,
        }
      );

      // Calculate average daily spend
      summary.averageDailySpend = summary.totalPurchases / 7;

      // Round the numbers
      summary.totalPurchases = Number(summary.totalPurchases.toFixed(2));
      summary.averageDailySpend = Number(summary.averageDailySpend.toFixed(2));

      const response = {
        dailyStats,
        summary,
      };

      res.json(response);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

const statisticsRouter = new StatisticsService();
export default statisticsRouter.router as Router;
