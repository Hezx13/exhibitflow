import mongoose, { Document, Schema } from 'mongoose';
import { Payment } from './List/list.model';
// Define the CurrencyCode type (you might want to expand this)
type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY'; // Example currencies

export interface ITransaction extends Document {
  date: Date;
  account: Payment;
  debit: number;
  credit: number;
  currency: CurrencyCode;
  description: string;
  reference?: string | null;
  department: string;
}

export const TransactionSchema = new Schema<ITransaction>({
  date: {
    type: Date,
    required: true,
  },
  account: {
    type: String,
    enum: Payment,
  },
  debit: {
    type: Number,
    default: 0,
  },
  credit: {
    type: Number,
    default: 0,
  },
  department: {
    type: String,
    default: null,
  },
  currency: {
    type: String,
  },
  description: {
    type: String,
  },
  reference: {
    type: Schema.Types.ObjectId,
    default: null,
  },
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
