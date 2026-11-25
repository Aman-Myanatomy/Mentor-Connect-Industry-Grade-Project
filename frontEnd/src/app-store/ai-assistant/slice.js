import { createSlice } from '@reduxjs/toolkit';

const initialState = { mockMode: false, demoAutoReply: false, isLoading: false, result: null, error: null };

export const aiAssistantSlice = createSlice({
  name: 'aiAssistant',
  initialState,
  reducers: {
    setStatus: (s, a) => {
      s.mockMode = a.payload.mockMode;
      s.demoAutoReply = a.payload.demoAutoReply;
    },
    setIsLoading: (s, a) => {
      s.isLoading = a.payload;
    },
    setResult: (s, a) => {
      s.result = a.payload;
    },
    setError: (s, a) => {
      s.error = a.payload;
    },
    reset: (s) => {
      s.result = null;
      s.error = null;
      s.isLoading = false;
    }
  }
});
export const aiAssistantActions = aiAssistantSlice.actions;
