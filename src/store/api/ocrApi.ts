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

export const ocrApi = createApi({
  reducerPath: 'ocrApi',
  baseQuery: baseQuery,
  endpoints: (builder) => ({
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

export const { useTestOCRQuery, useProcessOCRMutation } = ocrApi;
