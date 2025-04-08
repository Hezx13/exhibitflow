import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const libraryApi = createApi({
  reducerPath: 'libraryApi',
  baseQuery,
  tagTypes: ['Library'],
  endpoints: (builder) => ({
    getLibrary: builder.query<any[], void>({
      query: () => '/library',
      providesTags: ['Library'],
    }),
  }),
});

export const { useGetLibraryQuery } = libraryApi;