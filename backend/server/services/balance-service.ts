import { Router, Request, Response } from 'express';
import List, { List as IList, ITask, Payment } from 'server/models/List/list.model';
import { AuthenticatedRequest, authenticateToken } from 'server/middleware/authenticate';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import Transaction, { ITransaction } from 'server/models/transaction.model';
import verifyDepartment from 'server/middleware/department';

interface AddBalanceBody {
  amount: number;
  check: string;
  date: string;
  department: string;
}

class BalanceService {
  public router = Router();

  constructor() {
    this.initializeRoutes();
    this.router.use(verifyDepartment);
  }

  private initializeRoutes() {
    this.router.get('/current', authenticateToken, this.getCurrentBalance.bind(this));
    this.router.get('/totals', authenticateToken, this.getTotals.bind(this));
    this.router.post('/add', authenticateToken, this.addBalance.bind(this));
    this.router.post('/remove', authenticateToken, this.removeBalance.bind(this));
    this.router.get('/', authenticateToken, this.getBalance.bind(this));
    this.router.get('/generateCashOrder', authenticateToken, this.generateCashOrder.bind(this));
  }
  // TODO: allow to get balance for a specific account
  private async getCurrentBalance(req: Request, res: Response) {
    try {
      const { department } = req.headers;
      if (typeof department !== 'string') {
        return res.status(400).json({ error: 'Department must be a string' });
      }
      const [balance] = await Transaction.aggregate([
        {
          $match: {
            account: Payment.CASH,
            department,
          },
        },
        {
          $group: {
            _id: null,
            balance: {
              $sum: {
                $subtract: [{ $ifNull: ['$debit', 0] }, { $ifNull: ['$credit', 0] }],
              },
            },
          },
        },
      ]);
      console.log(balance);
      return res.status(200).json({ balance: balance?.balance ?? 0 });
    } catch (err) {
      return res.status(500).send(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  private async getTotals(req: AuthenticatedRequest, res: Response) {
    try {
      const lists = await List.find({ department: req.headers.department });
      if (!lists) return res.status(400).send('Lists not found');
      let _totalPrice = 0;
      let _totalPriceRough = 0;

      lists.forEach((list) => {
        list.tasks.forEach((task) => {
          if (task.status?.toLowerCase() !== 'done') {
            const price = task.price;
            const quantity = task.quantity;
            if (task.payment?.toLowerCase() === 'cash') {
              _totalPrice +=
                !Number.isNaN(Number(price)) && !Number.isNaN(Number(quantity))
                  ? Number(price) * Number(quantity)
                  : 0;
            }
            _totalPriceRough +=
              !Number.isNaN(Number(price)) && !Number.isNaN(Number(quantity))
                ? Number(price) * Number(quantity)
                : 0;
          }
        });
      });
      return res.status(200).json({
        total: parseFloat(_totalPrice.toFixed(2)),
        totalRough: parseFloat(_totalPriceRough.toFixed(2)),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to get totals.' });
    }
  }

  private async addBalance(req: Request<{}, {}, AddBalanceBody>, res: Response) {
    const { amount, check, date } = req.body;
    const department = req.headers.department;
    try {
      const validatedDate = date === 'Invalid Date' ? new Date() : new Date(date);
      await Transaction.insertMany({
        account: Payment.CASH,
        debit: amount,
        credit: 0,
        date: validatedDate,
        description: check,
        department,
      });
      return res.status(200).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to add balance.' });
    }
  }

  private async removeBalance(req: AuthenticatedRequest, res: Response) {
    const { id } = req.query;
    try {
      await Transaction.findOneAndDelete({
        _id: id,
      });
      return res.status(200).send();
    } catch (err) {
      return res.status(500).json({ error: 'Failed to remove balance.' });
    }
  }

  private async getBalance(req: AuthenticatedRequest, res: Response) {
    try {
      const { department } = req.headers;
      if (typeof department !== 'string') {
        return res.status(400).json({ error: 'Department must be a string' });
      }
      const loadedBalance = await Transaction.find({ department, debit: { $gt: 0 } });
      return res.json(loadedBalance);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to get balance.' });
    }
  }

  private async generateCashOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const { department } = req.headers;
      if (typeof department !== 'string') {
        return res.status(400).json({ error: 'Department must be a string' });
      }
      const lists = await List.find({ department }).lean();
      const workbook = XLSX.utils.book_new();
      const aoaData: (string | number | undefined)[][] = [
        [
          'Date ordered',
          'Material',
          'Quantity',
          'Price',
          'Unit',
          'Comment/Invoice',
          'Delivery Date',
          'Ordered By',
          'Status',
          'Payment',
          'Project',
        ],
      ];

      for (const list of lists ?? []) {
        for (const task of list.tasks) {
          if (task.status?.toLowerCase() === 'waiting for payment') {
            const parentProject = list.name;
            aoaData.push([
              task.date.toISOString(),
              task.name,
              task.quantity as number,
              task.price as number,
              task.unit,
              task.comment,
              task.deliveryDate?.toISOString() ?? '',
              task.orderedBy,
              task.status,
              task.payment,
              parentProject,
            ]);
          }
        }
      }

      const ws = XLSX.utils.aoa_to_sheet(aoaData);
      XLSX.utils.book_append_sheet(workbook, ws, 'Materials');
      const fileName = 'CashOrderMaterials.xlsx';
      const filePath = path.join(__dirname, fileName);

      XLSX.writeFile(workbook, filePath);

      return res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('File download failed:', err);
        }
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Could not remove temporary file:', unlinkErr);
          }
        });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('An error occurred');
    }
  }

  // Helper Functions
  private async calculateAllDebits(department: string): Promise<number> {
    const debits: ITransaction[] = await Transaction.find({ department, debit: { $gt: 0 } }).lean();
    return debits.reduce((total, debit) => total + debit.debit, 0);
  }

  private async calculateCurrentBalance(department: string): Promise<number> {
    const lists: IList[] = await List.find({ department }).lean();

    let tasksWithoutPrice = 0;
    let tasksDone: ITask[] = [];
    let totalSpendings = 0;

    for (let list of lists) {
      for (let task of list.tasks) {
        if (task.status?.toLowerCase() === 'done' && task.price) {
          tasksDone.push(task);
        }
      }
    }

    // for (let list of archives) {
    //   for (let task of list.tasks) {
    //     if (task.status?.toLowerCase() === 'done') {
    //       if (task.price && task.quantity) tasksDone.push(task);
    //       else tasksWithoutPrice++;
    //     }
    //   }
    // }

    for (let task of tasksDone) {
      const price = Number(task.price);
      const quantity = Number(task.quantity);
      if (!isNaN(price) && !isNaN(quantity)) {
        totalSpendings += price * quantity;
      }
    }
    const debit = await this.calculateAllDebits(department);
    return debit - totalSpendings;
  }
}

const balanceService = new BalanceService();
export default balanceService.router;
