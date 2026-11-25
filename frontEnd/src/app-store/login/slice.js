import { createSlice } from '@reduxjs/toolkit';

const initialState = { user: null, accessToken: null, isLoading: false, isRestoring: true, error: null };

export const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setIsLoading: (s, a) => {
      s.isLoading = a.payload;
    },
    setIsRestoring: (s, a) => {
      s.isRestoring = a.payload;
    },
    setError: (s, a) => {
      s.error = a.payload;
    },
    setSession: (s, a) => {
      s.user = a.payload.user;
      s.accessToken = a.payload.accessToken;
      s.error = null;
    },
    clearSession: (s) => {
      s.user = null;
      s.accessToken = null;
    }
  }
});
export const loginActions = loginSlice.actions;
