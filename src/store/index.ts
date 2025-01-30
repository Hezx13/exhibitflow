import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
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
      statisticsApi.middleware
    ),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
