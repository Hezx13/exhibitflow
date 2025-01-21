import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { EXHIBITFLOW_API_URL } from '../../api/http';

export const baseQuery = fetchBaseQuery({
  baseUrl: EXHIBITFLOW_API_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
  credentials: 'include',
});
