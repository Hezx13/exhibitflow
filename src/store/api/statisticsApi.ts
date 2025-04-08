import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

// Types for the statistics response
export interface PurchaseItem {
  name: string;
  price: number;
  quantity?: number;
  status: string;
  payment?: string;
}

export interface DailyStats {
  _id: string; // Date in YYYY-MM-DD format
  totalAmount: number;
  itemCount: number;
  averagePrice: number;
  items: PurchaseItem[];
}

export interface PurchaseStatsSummary {
  totalPurchases: number;
  totalItems: number;
  averageDailySpend: number;
}

export interface PurchaseStatsResponse {
  dailyStats: DailyStats[];
  summary: PurchaseStatsSummary;
}

export const statisticsApi = createApi({
  reducerPath: 'statisticsApi',
  baseQuery,
  endpoints: (builder) => ({
    getPurchaseStats: builder.query<PurchaseStatsResponse, void>({
      query: () => ({
        url: '/statistics/purchases',
        params: {
          department: localStorage.getItem('selectedDepartment'),
        },
      }),
    }),
  }),
});

export const { useGetPurchaseStatsQuery } = statisticsApi;
