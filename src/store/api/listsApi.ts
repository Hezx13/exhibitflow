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
  tagTypes: ['Lists', 'Reports'],
  endpoints: (builder) => ({
    save: builder.mutation<number, { payload: AppState; old: AppState }>({
      query: ({ payload }) => {
        const processedPayload = {
          listsToAdd: payload.listsToAdd,
          archiveToAdd: payload.archiveToAdd,
          listsToRemove: payload.listsToRemove,
          archiveToRemove: payload.archiveToRemove,
          listsToUpdate: payload.listsToUpdate,
          archiveToUpdate: payload.archiveToUpdate,
        };
        return {
          url: '/save',
          method: 'POST',
          body: processedPayload,
        };
      },
      invalidatesTags: ['Lists'],
    }),

    loadLists: builder.query<any, void>({
      query: () => ({
        url: '/lists',
        params: {
          department: localStorage.getItem('selectedDepartment'),
        },
      }),
      providesTags: ['Lists'],
    }),

    patchTask: builder.mutation<any, { listId: string; taskId: string; payload: any }>({
      query: ({ listId, taskId, payload }) => ({
        url: `/lists/${listId}/${taskId}`,
        method: 'PATCH',
        body: {
          taskData: payload
        },
      }),
      async onQueryStarted({ listId, taskId, payload }, { dispatch, queryFulfilled, getState }) {
        const patchResult = dispatch(
          listsApi.util.updateQueryData('loadSingleList', listId, (draft) => {
            const task = draft.tasks.find(t => t._id === taskId);
            if (task) {
              Object.assign(task, payload);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Lists'],
    }),

    patchList: builder.mutation<any, { listId: string; payload: any }>({
      query: ({ listId, payload }) => ({
        url: `/lists/${listId}`,
        method: 'PATCH',
        body: payload,
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

    loadSingleList: builder.query<any, string>({
      query: (listId) => ({
        url: `/lists/${listId}`,
      }),
      providesTags: ['Lists'],
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

    upload: builder.mutation<void, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('department', localStorage.getItem('selectedDepartment') || '');
        return {
          url: '/lists/upload',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Lists'],
    }),

    uploadPreview: builder.mutation<void, { file: File }>({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('department', localStorage.getItem('selectedDepartment') || '');
        return {
          url: `/lists/upload/preview`,
          method: 'POST',
          body: formData,
        };
      },
    }),

    uploadSingle: builder.mutation<void, { file: File; listId: string }>({
      query: ({ file, listId }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/upload/${listId}`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Lists'],
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
  useSaveMutation,
  useLoadListsQuery,
  useLoadSingleListQuery,
  useGetProjectsListQuery,
  useArchiveListMutation,
  useDeleteAllMutation,
  useLazyDownloadExcelQuery,
  useUploadMutation,
  useUploadSingleMutation,
  usePatchListPositionMutation,
  useGenerateReportMutation,
  useLoadReportsQuery,
  useAddDebitMutation,
  useRemoveDebitMutation,
  useLazyDownloadReportQuery,
  useUploadPreviewMutation,
  usePatchTaskMutation,
} = listsApi;
