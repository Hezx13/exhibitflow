import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { listsApi } from './listsApi';

export const uploadApi = createApi({
  reducerPath: 'uploadApi',
  baseQuery,
  endpoints: (builder) => ({
    uploadList: builder.mutation<void, { file: File }>({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('department', localStorage.getItem('selectedDepartment') || '');
        return {
          url: '/upload',
          method: 'POST',
          body: formData,
        };
      },
      onQueryStarted: async (args, { queryFulfilled }) => {
        await queryFulfilled;
        listsApi.util.invalidateTags(['Lists']);
      },
    }),
    uploadPreview: builder.mutation<void, { file: File }>({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('department', localStorage.getItem('selectedDepartment') || '');
        return {
          url: `/upload/preview`,
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
      onQueryStarted: async (args, { queryFulfilled }) => {
        await queryFulfilled;
        listsApi.util.invalidateTags(['Lists']);
      },
    }),
  }),
});

export const { useUploadListMutation, useUploadPreviewMutation, useUploadSingleMutation } =
  uploadApi;
