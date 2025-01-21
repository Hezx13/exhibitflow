import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

interface Project {
  id?: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  '';
  department?: string;
}

export const projectsApi = createApi({
  reducerPath: 'projectsApi',
  baseQuery,
  tagTypes: ['Projects', 'Departments'],
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => '/projects',
      providesTags: ['Projects'],
    }),

    getProjectById: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Projects', id }],
    }),

    createProject: builder.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: '/projects',
        method: 'POST',
        body: project,
      }),
      invalidatesTags: ['Projects'],
    }),
    updateProject: builder.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: `/projects/${project.id}`,
        method: 'PUT',
        body: project,
      }),
      invalidatesTags: (result, error, { id }) => ['Projects', { type: 'Projects', id }],
    }),

    deleteProject: builder.mutation<void, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Projects'],
    }),

    // Add project members
    addProjectMember: builder.mutation<void, { projectId: string; userId: string }>({
      query: ({ projectId, userId }) => ({
        url: `/projects/${projectId}/members`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Projects', id: projectId }],
    }),

    // Remove project members
    removeProjectMember: builder.mutation<void, { projectId: string; userId: string }>({
      query: ({ projectId, userId }) => ({
        url: `/projects/${projectId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Projects', id: projectId }],
    }),

    // Get project materials
    getProjectMaterials: builder.query<any[], string>({
      query: (projectId) => `/projects/${projectId}/materials`,
      providesTags: (result, error, projectId) => [{ type: 'Projects', id: projectId }],
    }),
    getDepartments: builder.query<any[], void>({
      query: () => '/projects/department',
      providesTags: ['Departments'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation,
  useGetProjectMaterialsQuery,
} = projectsApi;
