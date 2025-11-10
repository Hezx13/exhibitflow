import mongoose, { Schema } from "mongoose";

const FileRefSchema = new Schema(
  {
    fileData: { type: Schema.Types.ObjectId, ref: 'FileData', required: true },
    processingStatus: { 
      type: String, 
      enum: ['not_started', 'in_progress', 'completed', 'failed'], 
      default: 'not_started' 
    }
  },
  { _id: false }
);

const ocrJobSchema = new Schema(
  {
    startedAt: { type: Date },
    jobStatus: { 
      type: String, 
      enum: ['pending', 'in_progress', 'completed', 'failed'], 
      required: true, 
      default: 'pending' 
    },
    fileRefs: { type: [FileRefSchema], required: false }
  }, 
  { timestamps: true, collection: 'ocr_jobs' }
);

const OCRJob = mongoose.model('OCRJob', ocrJobSchema);

export default OCRJob;