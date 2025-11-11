import mongoose, { Schema } from "mongoose";

export const JOB_STATUS = {
  Pending: "pending",
  InProgress: "in_progress",
  Completed: "completed",
  Failed: "failed"
} as const;

const FileRefSchema = new Schema(
    {
    fileData: { type: Schema.Types.ObjectId, ref: 'FileData', required: true },
    processingStatus: { 
      type: String, 
      enum: Object.values(JOB_STATUS), 
      default: JOB_STATUS.Pending
    }
  },
  { _id: false }
);

const ocrJobSchema = new Schema(
  {
    startedAt: { type: Date },
    jobStatus: { 
      type: String, 
      enum: Object.values(JOB_STATUS), 
      required: true, 
      default: JOB_STATUS.Pending
    },
    fileRefs: { type: [FileRefSchema], required: false }
  }, 
  { timestamps: true, collection: 'ocr_jobs' }
);

ocrJobSchema.index({ jobStatus: 1 });

const OCRJob = mongoose.model('OCRJob', ocrJobSchema);

export default OCRJob;