import { configureStore } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';
import { balanceApi } from './api/balanceApi';
import { listsApi } from './api/listsApi';
import { departmentsApi } from './api/departmentsApi';
import { materialsApi } from './api/materialsApi';
import { projectsApi } from './api/projectsApi';
import { userApi } from './api/userApi';
import { uploadApi } from './api/uploadApi';
import { searchApi } from './api/searchApi';
import { statisticsApi } from './api/statisticsApi';
import authReducer from './slices/authSlice';
import { TypedUseSelectorHook } from 'react-redux';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { documentsApi } from './api/documentsApi';
import { libraryApi } from './api/libraryApi';
import { logsApi } from './api/logsApi';
import { reportsApi } from './api/reportsApi';
import { ocrApi } from './api/ocrApi';
import { filesApi } from './api/filesApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [balanceApi.reducerPath]: balanceApi.reducer,
    [listsApi.reducerPath]: listsApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [departmentsApi.reducerPath]: departmentsApi.reducer,
    [materialsApi.reducerPath]: materialsApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
    [searchApi.reducerPath]: searchApi.reducer,
    [statisticsApi.reducerPath]: statisticsApi.reducer,
    [documentsApi.reducerPath]: documentsApi.reducer,
    [libraryApi.reducerPath]: libraryApi.reducer,
    [logsApi.reducerPath]: logsApi.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,
    [ocrApi.reducerPath]: ocrApi.reducer,
    [filesApi.reducerPath]: filesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      balanceApi.middleware,
      listsApi.middleware,
      projectsApi.middleware,
      userApi.middleware,
      departmentsApi.middleware,
      materialsApi.middleware,
      uploadApi.middleware,
      searchApi.middleware,
      statisticsApi.middleware,
      documentsApi.middleware,
      libraryApi.middleware,
      logsApi.middleware,
      reportsApi.middleware,
      ocrApi.middleware,
      filesApi.middleware
    ),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
