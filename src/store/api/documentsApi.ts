import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

interface Document {
  _id: string;
  name: string;
  isActive: boolean;
  positionKey: string;
  data: string;
}

export const documentsApi = createApi({
  reducerPath: 'documentsApi',
  baseQuery,
  tagTypes: ['Document'],
  endpoints: (builder) => ({
    getDocument: builder.query<Document, string>({
      query: (documentId) => `/documents/${documentId}`,
      providesTags: (result, error, documentId) => [{ type: 'Document', id: documentId }],
    }),
    getDocuments: builder.query<Document[], void>({
      query: () => '/documents',
      providesTags: ['Document'],
    }),
    getDocumentsSidebar: builder.query<Document[], void>({
      query: () => '/documents/sidebar',
      providesTags: ['Document'],
    }),
    patchDocumentPosition: builder.mutation<Document, { documentId: string; payload: any }>({
      query: ({ documentId, payload }) => ({
        url: `/documents/${documentId}/position`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['Document'],
    }),
    createDocument: builder.mutation<Document, Partial<Document> | void>({
      query: (document) => ({
        url: '/documents',
        method: 'POST',
        body: document,
      }),
      invalidatesTags: ['Document'],
    }),
  }),
});

export const { useGetDocumentQuery, useCreateDocumentMutation, useGetDocumentsQuery, useGetDocumentsSidebarQuery, usePatchDocumentPositionMutation } =
  documentsApi;
