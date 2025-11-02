import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from 'server/middleware/authenticate';
import { Roles, permit } from 'server/middleware/permit';
import { Payment } from 'server/models/List/list.model';
import Transaction, { ITransaction } from 'server/models/transaction.model';

class FinancialOperationsService {
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/transaction',
      authenticateToken,
      permit(Roles.USER),
      this.createTransaction.bind(this)
    );
    this.router.get(
      '/transactions',
      authenticateToken,
      permit(Roles.USER),
      this.getAllTransactions.bind(this)
    );
    this.router.get(
      '/transaction/:id',
      authenticateToken,
      permit(Roles.USER),
      this.getTransactionById.bind(this)
    );
  }

  private async createTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        date,
        account,
        debit,
        credit,
        currency,
        description,
        reference,
      }: {
        date: string;
        account: Payment;
        debit: number;
        credit: number;
        currency: string;
        description: string;
        reference?: string;
      } = req.body;

      // Basic validation (might need more robust validation in the future)
      if (!date || !account || (!debit && !credit) || !currency || !description) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      if (debit < 0 || credit < 0) {
        return res.status(400).json({ message: 'Debit and credit must be non-negative' });
      }
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }

      const transaction: ITransaction = new Transaction({
        date: parsedDate,
        account,
        debit,
        credit,
        currency,
        description,
        reference,
      });

      await transaction.save();
      return res.status(201).json(transaction);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  private async getAllTransactions(_req: AuthenticatedRequest, res: Response) {
    try {
      const transactions = await Transaction.find();
      return res.status(200).json(transactions);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  private async getTransactionById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const transaction = await Transaction.findById(id);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      return res.status(200).json(transaction);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }
}

const financialOperationsService = new FinancialOperationsService();
export default financialOperationsService.router;
