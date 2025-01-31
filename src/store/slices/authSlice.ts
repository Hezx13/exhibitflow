import { createSlice } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';
const initialState = {
  token: null,
  role: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, role } = action.payload;
      state.token = token;
      state.role = role;
    },
    clearCredentials: (state) => {
      state.token = null;
      state.role = null;
    },
  },
});

const persistConfig = {
  key: 'auth',
  storage,
};

const persistedReducer = persistReducer(persistConfig, authSlice.reducer);

export const { setCredentials, clearCredentials } = authSlice.actions;
export default persistedReducer;
