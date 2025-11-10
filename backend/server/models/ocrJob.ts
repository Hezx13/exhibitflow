import mongoose, { Schema } from "mongoose";

const ocrJobSchema = new Schema({
    startedAt: { type: Date},
    jobStatus: { type: String, enum: ['pending', 'in_progress', 'completed', 'failed'], required: true , default: 'pending' },
    fileRefs: {
        ref: [{ type: Schema.Types.ObjectId, ref: 'FileData' }],
        processingStatus: { type: String, enum: ['not_started', 'in_progress', 'completed', 'failed'], default: 'not_started' }
    }
}, { timestamps: true, collection: 'ocr_jobs' });

const OCRJob = mongoose.model('OCRJob', ocrJobSchema);

export default OCRJob;