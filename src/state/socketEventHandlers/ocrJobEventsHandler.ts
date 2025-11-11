import { SocketType } from "../socketContext";
import { Dispatch } from "@reduxjs/toolkit";
import { ocrApi } from "../../store/api/ocrApi";

export interface OcrJobUpdatedPayload {
  jobId: string;
}

export const registerOcrJobEventHandlers = (socket: SocketType, dispatch: Dispatch) => {
  socket?.on('ocr-job-updated', (_data: OcrJobUpdatedPayload) => {
    dispatch(ocrApi.util.invalidateTags(['OCRJobs']));
  });
}