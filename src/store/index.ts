import { configureStore } from '@reduxjs/toolkit';
import { balanceApi } from './api/balanceApi';
import { listsApi } from './api/listsApi';
import { departmentsApi } from './api/departmentsApi';
import { materialsApi } from './api/materialsApi';
import { projectsApi } from './api/projectsApi';
import { userApi } from './api/userApi';
import { uploadApi } from './api/uploadApi';
import { searchApi } from './api/searchApi';

export const store = configureStore({
  reducer: {
    [balanceApi.reducerPath]: balanceApi.reducer,
    [listsApi.reducerPath]: listsApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [departmentsApi.reducerPath]: departmentsApi.reducer,
    [materialsApi.reducerPath]: materialsApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
    [searchApi.reducerPath]: searchApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      balanceApi.middleware,
      listsApi.middleware,
      projectsApi.middleware,
      userApi.middleware,
      departmentsApi.middleware,
      materialsApi.middleware,
      uploadApi.middleware,
      searchApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
