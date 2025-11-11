import mongoose, { Schema } from "mongoose";
import { JOB_STATUS } from "./ocrJob";

const OcrDataItemSchema = new Schema(
    {
        dt_polys: { type: [Schema.Types.Mixed], required: true },
        input_path: { type: String, required: true },
        model_settings: {
            use_doc_preprocessor: { type: Boolean, required: true },
            use_textline_orientation: { type: Boolean, required: true },
        },
        page_index: { type: Schema.Types.Mixed, required: false },
        rec_boxes: { type: [Schema.Types.Mixed], required: true },
        rec_polys: { type: [Schema.Types.Mixed], required: true },
        rec_scores: { type: [Number], required: true },
        rec_texts: { type: [String], required: true },
        return_word_box: { type: Boolean, required: true },
        text_det_params: { type: Schema.Types.Mixed, required: true },
        text_rec_score_thresh: { type: Number, required: true },
        text_type: { type: String, required: true },
        textline_orientation_angles: { type: [Number], required: true },
    },
    { _id: false }
);

const fileDataSchema = new Schema(
    {
        fileType: { type: String, required: true },
        fileName: { type: String, required: true },
        fileModifiedAt: { type: Date, required: true },
        fileSize: { type: Number, required: true },
        pdfParent: { type: Schema.Types.ObjectId },
        isInvoice: { type: Boolean, default: false },
        fileTags: { type: [String], default: [] },
        ocrStatus: {
            type: String,
            enum: Object.values(JOB_STATUS),
            default: JOB_STATUS.Pending,
        },
        ocrContent: { type: [OcrDataItemSchema], required: false }
    },
    { timestamps: true, collection: "file_data" }
);

fileDataSchema.index({ ocrStatus: 1, fileName: 1 });

const FileData = mongoose.model("FileData", fileDataSchema);
export type IFileData = mongoose.InferSchemaType<typeof fileDataSchema>;
export default FileData;
