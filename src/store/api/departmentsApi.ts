import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const departmentsApi = createApi({
  reducerPath: 'departmentsApi',
  baseQuery,
  tagTypes: ['Departments'],
  endpoints: (builder) => ({
    getDepartments: builder.query<any[], void>({
      query: () => '/departments',
      providesTags: ['Departments'],
    }),
    addDepartment: builder.mutation<any, { name: string }>({
      query: ({ name }) => ({
        url: '/departments',
        method: 'POST',
        body: { name },
      }),
      invalidatesTags: ['Departments'],
    }),

    patchDepartment: builder.mutation<any, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/departments/${id}`,
        method: 'PATCH',
        body: { name },
      }),
      invalidatesTags: ['Departments'],
    }),
    deleteDepartment: builder.mutation<any, string>({
      query: (id) => ({
        url: `/departments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Departments'],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useAddDepartmentMutation,
  useDeleteDepartmentMutation,
  usePatchDepartmentMutation,
} = departmentsApi;
