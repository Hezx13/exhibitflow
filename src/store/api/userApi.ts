import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { eventEmitter } from '../../state/EventEmitter';
import { clearCredentials, setCredentials } from '../slices/authSlice';
import { useAppDispatch } from '..';
import { departmentsApi } from './departmentsApi';

interface LoginCredentials {
  username: string;
  password: string;
}
export enum Roles {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  USER = 'User',
}

interface RegisterCredentials {
  username: string;
  password: string;
  email: string;
  department: string;
}

interface LoginResponse {
  token: string;
  role: string;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery,
  tagTypes: ['User', 'Users'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/authn/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data: loginData } = await queryFulfilled;

          // Dispatch to Redux store
          dispatch(
            setCredentials({
              token: loginData.token,
              role: loginData.role,
            })
          );

          eventEmitter.emit('login');
        } catch (err) {
          // Handle error if needed
        }
      },
    }),

    register: builder.mutation<any, RegisterCredentials>({
      query: (credentials) => ({
        url: '/authn/register',
        method: 'POST',
        body: credentials,
      }),
    }),

    getUserData: builder.query<any, void>({
      query: () => '/authn/user',
      providesTags: ['User'],
    }),

    getUsers: builder.query<any, void>({
      query: () => '/authz/users',
      providesTags: ['Users'],
    }),

    approveUser: builder.mutation<number, string>({
      query: (username) => ({
        url: '/authz/approveUser',
        method: 'POST',
        body: { userToApprove: username },
      }),
      invalidatesTags: ['Users'],
    }),

    disapproveUser: builder.mutation<number, string>({
      query: (username) => ({
        url: '/authz/disapproveUser',
        method: 'POST',
        body: { userToApprove: username },
      }),
      invalidatesTags: ['Users'],
    }),

    deleteUser: builder.mutation<number, string>({
      query: (username) => ({
        url: '/authz/removeUser',
        method: 'POST',
        body: { userToRemove: username },
      }),
      invalidatesTags: ['Users'],
    }),

    demoteUser: builder.mutation<number, string>({
      query: (username) => ({
        url: '/authz/demoteUser',
        method: 'POST',
        body: { userToDemote: username },
      }),
      invalidatesTags: ['Users'],
    }),

    promoteUser: builder.mutation<number, string>({
      query: (username) => ({
        url: '/authz/promoteUser',
        method: 'POST',
        body: { userToPromote: username },
      }),
      invalidatesTags: ['Users'],
    }),

    resetUserPassword: builder.mutation<number, string>({
      query: (username) => ({
        url: '/authn/resetUserPassword',
        method: 'POST',
        body: { userToReset: username },
      }),
    }),
    patchUser: builder.mutation<number, Partial<Omit<User, 'departments'>> & { departments: string[] }>({
      query: (userData) => ({
        url: `/authz/user/${userData._id}`,
        method: 'PATCH',
        body: userData,
      }),
      onQueryStarted: async (userData, { queryFulfilled, dispatch }) => {
        try {
          await queryFulfilled;
          if (userData.departments) {
            dispatch(departmentsApi.util.invalidateTags(['Departments']));
          }
        } catch (error) {
          console.error('Failed to update user:', error);
        }
      },
      invalidatesTags: ['Users'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUserDataQuery,
  useGetUsersQuery,
  useApproveUserMutation,
  useDisapproveUserMutation,
  useDeleteUserMutation,
  useDemoteUserMutation,
  usePromoteUserMutation,
  useResetUserPasswordMutation,
  usePatchUserMutation,
} = userApi;

// Export logout function (since it doesn't require an API call)
export const logout = () => {
  const dispatch = useAppDispatch();
  dispatch(clearCredentials());
};
