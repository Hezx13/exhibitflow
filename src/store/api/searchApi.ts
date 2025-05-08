import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export interface SearchResultItem {
  _id: string;
  name: string;
  score: number;
  type: 'list' | 'task' | 'document';
  status?: string;
  listId?: string;
  listName?: string;
  comment?: string;
}

export interface SearchResponse {
  count: number;
  results: SearchResultItem[];
}

export const searchApi = createApi({
  reducerPath: 'searchApi',
  baseQuery,
  endpoints: (builder) => ({
    search: builder.query<SearchResponse, string>({
      query: (query) => ({
        url: `/search`,
        params: {
          query,
        },
      }),
    }),
  }),
});

export const { useSearchQuery } = searchApi;
