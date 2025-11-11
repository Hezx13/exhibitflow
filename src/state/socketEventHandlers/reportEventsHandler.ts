import { SocketType } from "../socketContext";
import { Dispatch } from "@reduxjs/toolkit";
import { reportsApi } from "../../store/api/reportsApi";

export interface ReportReadyPayload {
  status: 'success' | 'error';
  reportId?: string;
  message: string;
  period: {
    start: string;
    end: string;
  };
  payment: string;
  timestamp: string;
}

export const registerReportEventHandlers = (socket: SocketType, dispatch: Dispatch) => {
  socket?.on('report-ready', (_data: ReportReadyPayload) => {
    dispatch(reportsApi.util.invalidateTags(['Report']));
  });
}