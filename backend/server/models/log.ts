import mongoose, { Document, Schema } from 'mongoose';

interface ILog extends Document {
  endpoint: string;
  method: string;
  userId: string;
  timestamp: Date;
  requestBody: any;
  requestParams: any;
  requestQuery: any;
  response: any;
  responseStatus: number;
  executionTime: number;
  userAgent: string;
  ip: string;
}

const logSchema = new Schema<ILog>({
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  userId: { type: String, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  requestBody: Schema.Types.Mixed,
  requestParams: Schema.Types.Mixed,
  requestQuery: Schema.Types.Mixed,
  response: Schema.Types.Mixed,
  responseStatus: Number,
  executionTime: Number,
  userAgent: String,
  ip: String,
});

logSchema.index({ timestamp: -1 });
logSchema.index({ endpoint: 1, timestamp: -1 });
logSchema.index({ userId: 1, timestamp: -1 });

export const Log = mongoose.model<ILog>('Log', logSchema);
