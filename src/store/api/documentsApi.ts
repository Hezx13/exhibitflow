import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

interface Document {
  _id: string;
  documentName: string;
  isActive: boolean;
  positionKey: string;
  data: string;
}

export const documentsApi = createApi({
  reducerPath: 'documentsApi',
  baseQuery,
  tagTypes: ['Document', 'DocumentsSidebar'],
  endpoints: (builder) => ({
    getDocument: builder.query<Document, string>({
      query: (documentId) => `/documents/${documentId}`,
      providesTags: (result, error, documentId) => [{ type: 'Document', id: documentId }],
    }),
    deleteDocument: builder.mutation<Document, string>({
      query: (documentId) => ({
        url: `/documents/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Document', 'DocumentsSidebar'],
    }),
    getDocuments: builder.query<Document[], void>({
      query: () => '/documents',
      providesTags: ['Document'],
    }),
    getDocumentsSidebar: builder.query<Document[], void>({
      query: () => '/documents/sidebar',
      providesTags: ['DocumentsSidebar'],
    }),
    patchDocumentPosition: builder.mutation<Document, { documentId: string; payload: any }>({
      query: ({ documentId, payload }) => ({
        url: `/documents/${documentId}/position`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['Document', 'DocumentsSidebar'],
    }),
    patchDocument: builder.mutation<Document, { documentId: string; payload: any }>({
      query: ({ documentId, payload }) => ({
        url: `/documents/${documentId}`,
        method: 'PATCH',
        body: payload,
      }),
      async onQueryStarted({ documentId, payload }, { dispatch, queryFulfilled }) {
        const documentPatch = dispatch(
          documentsApi.util.updateQueryData('getDocument', documentId, (draft) => {
            Object.assign(draft, payload);
          })
        );
        const sidebarPatch = dispatch(
          documentsApi.util.updateQueryData('getDocumentsSidebar', undefined, (draft) => {
            const document = draft.find((d) => d._id === documentId);
            if (document) {
              Object.assign(document, payload);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          documentPatch.undo();
          sidebarPatch.undo();
        }
      },
      invalidatesTags: (result, error, { documentId }) => [
        { type: 'Document', id: documentId },
        'DocumentsSidebar',
      ],
    }),
    createDocument: builder.mutation<Document, Partial<Document> | void>({
      query: (document) => ({
        url: '/documents',
        method: 'POST',
        body: document,
      }),
      invalidatesTags: ['Document', 'DocumentsSidebar'],
    }),
  }),
});

export const {
  useGetDocumentQuery,
  useCreateDocumentMutation,
  useGetDocumentsQuery,
  useGetDocumentsSidebarQuery,
  usePatchDocumentPositionMutation,
  usePatchDocumentMutation,
  useDeleteDocumentMutation,
} = documentsApi;
