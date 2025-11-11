import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export interface OCRResponse {
  success: boolean;
  imagePath: string;
  result: string;
  error?: string;
}

export interface OCRTestResponse {
  success: boolean;
  result: string;
  error?: string;
}

export interface OCRFileRef {
    fileData: string;
    processingStatus: 'in_progress' | 'not_started' | 'completed' | 'failed';
}

export interface OCRJob {
    _id: string;
    jobStatus: string;
    fileRefs: OCRFileRef[];
    createdAt: string;
    updatedAt: string;
}

export const ocrApi = createApi({
  reducerPath: 'ocrApi',
  baseQuery: baseQuery,
  tagTypes: ['OCRJobs'],
  endpoints: (builder) => ({
    ocrJobs: builder.query<any[], void>({
      query: () => ({
        url: '/ocr/unfinished-jobs',
        method: 'GET',
      }),
        providesTags: ['OCRJobs'],
    }),
    testOCR: builder.query<OCRTestResponse, void>({
      query: () => ({
        url: '/ocr/test',
        method: 'GET',
      }),
    }),
    processOCR: builder.mutation<OCRResponse, { imagePath: string }>({
      query: (args) => ({
        url: '/ocr/process',
        method: 'POST',
        body: args,
      }),
    }),
  }),
});

export const { useTestOCRQuery, useProcessOCRMutation, useOcrJobsQuery } = ocrApi;
