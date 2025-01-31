import { fetchBaseQuery, RootState } from '@reduxjs/toolkit/query/react';
import { EXHIBITFLOW_API_URL } from '../../api/http';

export const baseQuery = fetchBaseQuery({
  baseUrl: EXHIBITFLOW_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
  credentials: 'include',
});
