import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { eventEmitter } from '../../state/EventEmitter';

interface LoginCredentials {
  username: string;
  password: string;
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
    login: builder.mutation<number, LoginCredentials>({
      query: (credentials) => ({
        url: '/authn/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data === 200) {
            const response = await fetch('/auth/login', {
              method: 'POST',
              body: JSON.stringify(_),
              headers: { 'Content-Type': 'application/json' },
            });
            const loginData: LoginResponse = await response.json();
            localStorage.setItem('token', loginData.token);
            localStorage.setItem('role', loginData.role);
            eventEmitter.emit('login');
          }
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
    patchUser: builder.mutation<number, { userData: Partial<User> }>({
      query: ({ userData }) => ({
        url: '/authz/user',
        method: 'PATCH',
        body: { userData },
      }),
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
  localStorage.removeItem('token');
  window.location.reload();
};
