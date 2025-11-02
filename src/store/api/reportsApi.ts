import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export interface ReportPeriod {
  start: string;
  end: string;
}

export interface ReportMaterial {
  id: string;
  name: string;
  article: string;
  price: string;
  quantity: number;
  date: string;
  unit: string;
  comment: string;
  deliveryDate?: string;
  orderedBy: string;
  status: string;
  payment: string;
  listParent?: {
    id: string;
    name: string;
  };
  transaction?: any;
}

export interface DebitEntry {
  account: string;
  credit: number;
  date: string;
  debit: number;
  department: string;
  description: string;
  reference: string | null;
  __v: number;
  _id: string;
}

export interface Report {
  _id: string;
  materials: ReportMaterial[];
  month: ReportPeriod;
  debit: DebitEntry[];
  credit: number;
  department: string;
  activeProjects: Array<{
    id: string;
    name: string;
  }>;
  payment: string;
}

export interface GenerateReportRequest {
  periodStart: string;
  periodEnd: string;
  payment: string;
}

export interface AddDebitRequest {
  periodStart: string;
  valueToInsert: DebitEntry;
  pay: string;
  department: string;
}

export interface RemoveDebitRequest {
  periodStart: string;
  valueToRemove: DebitEntry;
  pay: string;
  department: string;
}

export interface DownloadReportParams {
    id: string;
}

export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery,
  tagTypes: ['Report', 'ReportDetail'],
  endpoints: (builder) => ({
    generateReport: builder.mutation<string, GenerateReportRequest>({
      query: (data) => ({
        url: '/reports/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Report'],
    }),

    getReports: builder.query<{ reports: Report[] }, void>({
      query: () => '/reports',
      providesTags: ['Report'],
    }),

    getReportDetails: builder.query<Report, string>({
      query: (id) => `/reports/${id}`,
      providesTags: ['ReportDetail'],
    }),

    addDebit: builder.mutation<{ message: string }, AddDebitRequest>({
      query: (data) => ({
        url: '/reports/debit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Report'],
    }),

    removeDebit: builder.mutation<{ message: string }, RemoveDebitRequest>({
      query: (data) => ({
        url: '/reports/debit',
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['Report'],
    }),

    downloadReport: builder.query<Blob, DownloadReportParams>({
      query: (params) => ({
        url: '/reports/download',
        method: 'GET',
        responseType: 'blob',
        params: {
          id: params.id,
        },
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGenerateReportMutation,
  useGetReportsQuery,
  useGetReportDetailsQuery,
  useAddDebitMutation,
  useRemoveDebitMutation,
  useLazyDownloadReportQuery,
} = reportsApi; 