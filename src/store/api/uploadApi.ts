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
      onQueryStarted: async (args, { queryFulfilled, dispatch }) => {
        await queryFulfilled;
        console.log('Invalidating Lists tag');
        dispatch(listsApi.util.invalidateTags(['Lists']));
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

    uploadSingle: builder.mutation<any, { file: File; listId: string; department: string }>({
      query: ({ file, listId, department }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('department', department);
        return {
          url: `/upload/${listId}`,
          method: 'POST',
          body: formData,
        };
      },
      onQueryStarted: async (args, { queryFulfilled, dispatch }) => {
        await queryFulfilled;
        dispatch(listsApi.util.invalidateTags([
          { type: 'SingleList', id: args.listId },
          'SingleList'
        ]));
      },
    }),
  }),
});

export const { useUploadListMutation, useUploadPreviewMutation, useUploadSingleMutation } =
  uploadApi;
