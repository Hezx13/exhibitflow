import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

interface Supplier {
  name: string;
  phone: string;
  email: string;
  category: string;
}

interface Material {
  materialId: string[];
  listId: string;
}

interface ProjectMaterial {
  projectId: string;
  materialId: string;
}

export const materialsApi = createApi({
  reducerPath: 'materialsApi',
  baseQuery,
  tagTypes: ['SavedMaterials', 'Categories', 'Suppliers'],
  endpoints: (builder) => ({
    getSavedMaterials: builder.query({
      query: () => ({
        url: '/materials',
      }),
    }),

    saveMaterial: builder.mutation<number, Material>({
      query: ({ materialId, listId }) => ({
        url: '/materials',
        method: 'POST',
        body: { materialId, listId },
      }),
      invalidatesTags: ['SavedMaterials'],
    }),

    removeMaterial: builder.mutation<number, string>({
      query: (materialId) => ({
        url: `/materials/removeMaterial`,
        method: 'DELETE',
        params: { idToRemove: materialId },
      }),
      invalidatesTags: ['SavedMaterials'],
    }),

    editMaterial: builder.mutation<number, any>({
      query: (material) => ({
        url: '/materials',
        method: 'PATCH',
        body: material,
      }),
      invalidatesTags: ['SavedMaterials'],
    }),

    getMaterialCount: builder.query<number, void>({
      query: () => '/materials/savedMaterialCount',
    }),

    addToProject: builder.mutation<number, ProjectMaterial>({
      query: ({ materialId, projectId }) => ({
        url: '/materials/addToProject',
        method: 'PUT',
        body: { materialId, projectId },
      }),
    }),

    getCategories: builder.query<string[], void>({
      query: () => '/materials/categories',
      providesTags: ['Categories'],
    }),

    addCategory: builder.mutation<number, string>({
      query: (name) => ({
        url: '/materials/createCategory',
        method: 'POST',
        body: { name },
      }),
      invalidatesTags: ['Categories'],
    }),

    getSuppliers: builder.query<any[], void>({
      query: () => '/materials/suppliers',
      providesTags: ['Suppliers'],
    }),

    addSupplier: builder.mutation<number, Supplier>({
      query: (supplier) => ({
        url: '/materials/supplier',
        method: 'POST',
        body: supplier,
      }),
      invalidatesTags: ['Suppliers'],
    }),
  }),
});

export const {
  useGetSavedMaterialsQuery,
  useSaveMaterialMutation,
  useRemoveMaterialMutation,
  useEditMaterialMutation,
  useGetMaterialCountQuery,
  useAddToProjectMutation,
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useGetSuppliersQuery,
  useAddSupplierMutation,
} = materialsApi;
