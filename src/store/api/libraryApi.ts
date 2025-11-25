import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
export enum ResourseType {
  DOCUMENT = 'document',
  TABLE = 'table',
  FILE = 'file',
  ALL = 'all',
}
interface LibraryPayload {
  type: ResourseType;
}

export const libraryApi = createApi({
  reducerPath: 'libraryApi',
  baseQuery,
  tagTypes: ['Library'],
  endpoints: (builder) => ({
    getLibrary: builder.query<any[], LibraryPayload>({
      query: ({ type = 'all' }) => `/library?type=${type}`,
      providesTags: ['Library'],
    }),
  }),
});

export const { useGetLibraryQuery } = libraryApi;
