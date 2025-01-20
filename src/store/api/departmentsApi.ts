import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const departmentsApi = createApi({
  reducerPath: 'departmentsApi',
  baseQuery,
  tagTypes: ['Departments'],
  endpoints: (builder) => ({
    getDepartments: builder.query<any[], void>({
      query: () => '/projects/department',
      providesTags: ['Departments'],
    }),

    addDepartment: builder.mutation({
      query: (name) => ({
        url: '/projects/department',
        method: 'POST',
        body: { name },
      }),
      invalidatesTags: ['Departments'],
    }),

    deleteDepartment: builder.mutation({
      query: (name) => ({
        url: `/projects/department/${name}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Departments'],
    }),
  }),
});

export const { useGetDepartmentsQuery, useAddDepartmentMutation, useDeleteDepartmentMutation } =
  departmentsApi;
