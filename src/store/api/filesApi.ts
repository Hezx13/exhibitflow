import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// TODO: Move to env variable
const FILE_SERVER_URL = 'http://localhost:4501/api';

export const filesApi = createApi({
  reducerPath: 'filesApi',
  baseQuery: fetchBaseQuery({ baseUrl: FILE_SERVER_URL }),
  tagTypes: ['Files'],
  endpoints: (builder) => ({
    uploadFile: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Files'],
    }),
  }),
});

export const { useUploadFileMutation } = filesApi;
