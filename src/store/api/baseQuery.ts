import { fetchBaseQuery, RootState } from '@reduxjs/toolkit/query/react';
import { EXHIBITFLOW_API_URL } from '../../api/http';

export const baseQuery = fetchBaseQuery({
  baseUrl: EXHIBITFLOW_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as any;
    const token = state.auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
      headers.set('department', state.auth.department);
    }
    return headers;
  },
  credentials: 'include',
});
