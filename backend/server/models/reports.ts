import mongoose, { Schema } from 'mongoose';
import {IReport } from './types';
import { TransactionSchema } from './transaction.model';

const reportPeriodSchema = new Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
});

const activeProjectSchema = new Schema({
  id: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
});

const reportMaterialSchema = new Schema({
  id: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  article: String,
  price: String,
  quantity: Number,
  date: { type: Date, required: true },
  unit: String,
  comment: String,
  deliveryDate: String,
  orderedBy: String,
  status: String,
  payment: String,
  listParent: { type: activeProjectSchema, required: true },
  transaction: { type: Schema.Types.ObjectId, ref: 'Transaction', required: false },
});

const reportSchema = new Schema<IReport>({
  materials: [reportMaterialSchema],
  month: { type: reportPeriodSchema, required: true },
  debit: [TransactionSchema],
  credit: { type: Number, required: true },
  department: { type: String, required: true },
  activeProjects: [activeProjectSchema],
  payment: { type: String, required: true },
});

export const Report = mongoose.model<IReport>('Report', reportSchema);
