import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

interface AppState {
  listsToAdd?: any[];
  archiveToAdd?: any[];
  listsToRemove?: any[];
  archiveToRemove?: any[];
  listsToUpdate?: any[];
  archiveToUpdate?: any[];
}

interface ReportParams {
  period: { start: string; end: string };
  payment: string;
}

interface DebitParams {
  period: string;
  debit: number;
  payment: string;
}

export const listsApi = createApi({
  reducerPath: 'listsApi',
  baseQuery,
  tagTypes: ['Lists', 'Reports', 'SingleList'],
  endpoints: (builder) => ({
    loadLists: builder.query<any, void>({
      query: () => ({
        url: '/lists',
        params: {
          department: localStorage.getItem('selectedDepartment'),
        },
      }),
      providesTags: ['Lists'],
    }),

    loadSingleList: builder.query<any, string>({
      query: (listId) => ({
        url: `/lists/${listId}`,
      }),
      providesTags: (_result, _error, listId) => [{ type: 'SingleList', id: listId }, 'SingleList'],
    }),

    addTask: builder.mutation<
      any,
      { listId: string; taskData?: Omit<Task, '_id' | 'positionKey'> }
    >({
      query: ({ listId, taskData }) => ({
        url: `/lists/${listId}/tasks`,
        method: 'POST',
        body: {
          taskData,
        },
      }),
      invalidatesTags: (result, error, { listId }) => [
        { type: 'SingleList', id: listId },
        'SingleList',
      ],
    }),

    patchTask: builder.mutation<any, { listId: string; taskId: string; payload: any }>({
      query: ({ listId, taskId, payload }) => ({
        url: `/lists/${listId}/tasks/${taskId}`,
        method: 'PATCH',
        body: {
          taskData: payload,
        },
      }),
      async onQueryStarted({ listId, taskId, payload }, { dispatch, queryFulfilled, getState }) {
        const patchResult = dispatch(
          listsApi.util.updateQueryData('loadSingleList', listId, (draft) => {
            const task = draft.tasks.find((t) => t._id === taskId);
            if (task) {
              Object.assign(task, payload);
              draft.tasks.sort((a, b) => a.positionKey.localeCompare(b.positionKey));
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { listId }) => [
        { type: 'SingleList', id: listId },
        'SingleList',
      ],
    }),

    patchList: builder.mutation<any, { listId: string; payload: Partial<List> }>({
      query: ({ listId, payload }) => ({
        url: `/lists/${listId}`,
        method: 'PATCH',
        body: payload,
      }),
      async onQueryStarted({ listId, payload }, { dispatch, queryFulfilled, getState }) {
        const patchResult = dispatch(
          listsApi.util.updateQueryData('loadSingleList', listId, (draft) => {
            Object.assign(draft, payload);
          })
        );
        const patchLists = dispatch(
          listsApi.util.updateQueryData('loadLists', undefined, (draft) => {
            const list = draft.find((l) => l._id === listId);
            if (list) {
              Object.assign(list, payload);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
          patchLists.undo();
        }
      },
      invalidatesTags: ['Lists'],
    }),

    addList: builder.mutation<any, { listData: Omit<List, '_id' | 'positionKey'> }>({
      query: ({ listData }) => ({
        url: '/lists',
        method: 'POST',
        body: listData,
      }),
      invalidatesTags: ['Lists'],
    }),

    patchListPosition: builder.mutation<any, { listId: string; payload: any }>({
      query: ({ listId, payload }) => ({
        url: `/lists/${listId}/position`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['Lists'],
    }),

    getProjectsList: builder.query<any[], void>({
      query: () => '/projectsList',
      providesTags: ['Lists'],
    }),

    archiveList: builder.mutation<void, string>({
      query: (listId) => ({
        url: '/archive',
        method: 'POST',
        body: { listId },
      }),
      invalidatesTags: ['Lists'],
    }),
    deleteList: builder.mutation<number, string>({
      query: (listId) => ({
        url: `/lists/${listId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Lists'],
    }),
    deleteAll: builder.mutation<number, string>({
      query: (toDelete) => ({
        url: '/deleteAll',
        method: 'DELETE',
        params: { toDelete },
      }),
      invalidatesTags: ['Lists'],
    }),

    downloadExcel: builder.query<Blob, void>({
      query: () => ({
        url: '/download',
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'MyWorkbook.xlsx');
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          return blob;
        },
      }),
    }),

    generateReport: builder.mutation<number, ReportParams>({
      query: ({ period, payment }) => ({
        url: '/generate_report',
        method: 'POST',
        body: {
          ...period,
          payment,
          department: localStorage.getItem('selectedDepartment'),
        },
      }),
      invalidatesTags: ['Reports'],
    }),

    loadReports: builder.query<any[], void>({
      query: () => ({
        url: '/reports',
        params: {
          department: localStorage.getItem('selectedDepartment'),
        },
      }),
      providesTags: ['Reports'],
    }),

    addDebit: builder.mutation<number, DebitParams>({
      query: ({ period, debit, payment }) => ({
        url: '/add_debit',
        method: 'POST',
        body: {
          periodStart: period,
          valueToInsert: debit,
          pay: payment,
          department: localStorage.getItem('selectedDepartment'),
        },
      }),
      invalidatesTags: ['Reports'],
    }),

    removeDebit: builder.mutation<number, DebitParams>({
      query: ({ period, debit, payment }) => ({
        url: '/remove_debit',
        method: 'POST',
        body: {
          periodStart: period,
          valueToRemove: debit,
          pay: payment,
          department: localStorage.getItem('selectedDepartment'),
        },
      }),
      invalidatesTags: ['Reports'],
    }),

    downloadReport: builder.query<Blob, ReportParams>({
      query: ({ period, payment }) => ({
        url: '/download_report',
        params: {
          periodStart: period,
          pay: payment,
          department: localStorage.getItem('selectedDepartment'),
        },
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute(
            'download',
            `Report${period} ${localStorage.getItem('selectedDepartment')} ${payment}.xlsx`
          );
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
  useLoadListsQuery,
  useLoadSingleListQuery,
  useGetProjectsListQuery,
  useArchiveListMutation,
  useDeleteAllMutation,
  useLazyDownloadExcelQuery,
  usePatchListPositionMutation,
  useGenerateReportMutation,
  useLoadReportsQuery,
  useDeleteListMutation,
  useAddDebitMutation,
  useRemoveDebitMutation,
  useLazyDownloadReportQuery,
  usePatchTaskMutation,
  useAddTaskMutation,
  useAddListMutation,
  usePatchListMutation,
} = listsApi;
