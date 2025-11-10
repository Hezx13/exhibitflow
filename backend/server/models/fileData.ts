import mongoose, { Schema } from "mongoose";

const fileDataSchema = new Schema({
    fileType: { type: String, required: true },
    fileName: { type: String, required: true },
    fileModifiedAt: { type: Date, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    pdfParent: { type: Schema.Types.ObjectId},
    isInvoice: { type: Boolean, default: false},
    ocrStatus: { type: String, enum: ['pending', 'in_progress', 'completed', 'failed'], default: 'pending' },
    textContent: {
        type: {
            text_lines: { type: [String], required: false },
            ocr_data: { type: [Schema.Types.Mixed], required: false },
            pages: { type: Number, required: false }
        },
        required: false
    }
}, { timestamps: true, collection: 'file_data' });

const FileData = mongoose.model('FileData', fileDataSchema);
export type IFileData = mongoose.InferSchemaType<typeof fileDataSchema>;
export default FileData;
