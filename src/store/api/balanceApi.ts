import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

interface Debit {
  amount: number;
  description?: string;
}

interface BalanceResponse {
  amount: number;
  transactions?: any[];
}

export const balanceApi = createApi({
  reducerPath: 'balanceApi',
  baseQuery,
  tagTypes: ['Balance'],
  endpoints: (builder) => ({
    addBalance: builder.mutation<number, Debit>({
      query: (debit) => ({
        url: '/balance/add_balance',
        method: 'POST',
        body: debit,
      }),
      invalidatesTags: ['Balance'],
    }),

    removeBalance: builder.mutation<number, Debit>({
      query: (debit) => ({
        url: '/balance/remove_balance',
        method: 'POST',
        body: debit,
      }),
      invalidatesTags: ['Balance'],
    }),

    loadBalance: builder.query<BalanceResponse, void>({
      query: () => ({
        url: '/balance/balance',
        params: {
          department: localStorage.getItem('selectedDepartment'),
        },
        headers: {
          Accept: 'application/json',
        },
      }),
      providesTags: ['Balance'],
    }),

    getCurrentBalance: builder.query<number, void>({
      query: () => ({
        url: '/balance/currentBalance',
        params: {
          department: localStorage.getItem('selectedDepartment'),
        },
        headers: {
          Accept: 'application/json',
        },
      }),
      providesTags: ['Balance'],
    }),

    getTotals: builder.query<any, void>({
      query: () => ({
        url: '/balance/totals',
        params: {
          department: localStorage.getItem('selectedDepartment'),
        },
      }),
    }),

    generateCashOrder: builder.query<Blob, void>({
      query: () => ({
        url: '/balance/generateCashOrder',
        params: {
          department: localStorage.getItem('selectedDepartment'),
        },
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `CashOrder${Date.now()}.xlsx`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          return blob;
        },
      }),
    }),
  }),
});

export const {
  useAddBalanceMutation,
  useRemoveBalanceMutation,
  useLoadBalanceQuery,
  useGetCurrentBalanceQuery,
  useLazyGenerateCashOrderQuery,
  useGetTotalsQuery,
} = balanceApi;
