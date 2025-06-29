import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export interface LogEntry {
  _id: string;
  endpoint: string;
  method: string;
  userId?: string;
  timestamp: string;
  requestBody: any;
  requestParams: any;
  requestQuery: any;
  response: any;
  responseStatus: number;
  executionTime: number;
  userAgent: string;
  ip: string;
}

export interface LogsResponse {
  logs: LogEntry[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalLogs: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface LogsQueryParams {
  page?: number;
  limit?: number;
  method?: string;
  endpoint?: string;
  userId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DeleteLogsParams {
  logIds?: string[];
  filter?: {
    startDate?: string;
    endDate?: string;
    method?: string;
    userId?: string;
    endpoint?: string;
  };
}

export interface DeleteLogsResponse {
  message: string;
  deletedCount: number;
}

export const logsApi = createApi({
  reducerPath: 'logsApi',
  baseQuery,
  tagTypes: ['Logs', 'Log'],
  endpoints: (builder) => ({
    getLogs: builder.query<LogsResponse, LogsQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.append(key, String(value));
            }
          });
        }

        return {
          url: `/logs?${queryParams.toString()}`,
        };
      },
      providesTags: ['Logs'],
    }),

    getLogById: builder.query<LogEntry, string>({
      query: (logId) => ({
        url: `/logs/${logId}`,
      }),
      providesTags: (result, error, logId) => [{ type: 'Log', id: logId }],
    }),

    getLogsByUser: builder.query<LogsResponse, { userId: string } & LogsQueryParams>({
      query: ({ userId, ...params }) => {
        const queryParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });

        return {
          url: `/logs/user/${userId}?${queryParams.toString()}`,
        };
      },
      providesTags: (result, error, { userId }) => [
        { type: 'Logs', id: `user-${userId}` },
        'Logs',
      ],
    }),

    getLogsByEndpoint: builder.query<LogsResponse, { endpoint: string } & LogsQueryParams>({
      query: ({ endpoint, ...params }) => {
        const queryParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });

        return {
          url: `/logs/endpoint/${encodeURIComponent(endpoint)}?${queryParams.toString()}`,
        };
      },
      providesTags: (result, error, { endpoint }) => [
        { type: 'Logs', id: `endpoint-${endpoint}` },
        'Logs',
      ],
    }),

    deleteLog: builder.mutation<void, string>({
      query: (logId) => ({
        url: `/logs/${logId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, logId) => [
        { type: 'Log', id: logId },
        'Logs',
      ],
    }),

    deleteLogs: builder.mutation<DeleteLogsResponse, DeleteLogsParams>({
      query: (params) => ({
        url: '/logs',
        method: 'DELETE',
        body: params,
      }),
      invalidatesTags: ['Logs'],
    }),
  }),
});

export const {
  useGetLogsQuery,
  useGetLogByIdQuery,
  useGetLogsByUserQuery,
  useGetLogsByEndpointQuery,
  useDeleteLogMutation,
  useDeleteLogsMutation,
} = logsApi; 