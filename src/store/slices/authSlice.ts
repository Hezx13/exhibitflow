import { createSlice } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';
const initialState = {
  token: null,
  role: null,
  department: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setDepartment: (state, action) => {
      state.department = action.payload;
    },
    setCredentials: (state, action) => {
      const { token, role } = action.payload;
      state.token = token;
      state.role = role;
    },
    clearCredentials: (state) => {
      state.token = null;
      state.role = null;
      state.department = null;
    },
  },
});

const persistConfig = {
  key: 'auth',
  storage,
};

const persistedReducer = persistReducer(persistConfig, authSlice.reducer);

export const { setCredentials, clearCredentials, setDepartment } = authSlice.actions;
export default persistedReducer;
