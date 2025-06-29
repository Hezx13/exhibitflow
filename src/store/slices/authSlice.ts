import { createSlice } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';
const initialState = {
  token: null,
  role: null,
  department: null,
  userName: null,
  isAdmin: false,
  isManager: false,
  isUser: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setDepartment: (state, action) => {
      state.department = action.payload;
    },
    setCredentials: (state, action) => {
      const { token, role, userName } = action.payload;
      state.token = token;
      state.role = role;
      state.userName = userName;
      state.isAdmin = role === 'Admin';
      state.isManager = role === 'Manager';
      state.isUser = role === 'User';
    },
    clearCredentials: (state) => {
      state.token = null;
      state.role = null;
      state.department = null;
      state.userName = null;
      state.isAdmin = false;
      state.isManager = false;
      state.isUser = false;
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
