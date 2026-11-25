import { createSlice } from '@reduxjs/toolkit';

const initialState = { isMatching: false, response: null, error: null };

export const mentorMatchingSlice = createSlice({
  name: 'mentorMatching',
  initialState,
  reducers: {
    setIsMatching: (s, a) => {
      s.isMatching = a.payload;
    },
    setResponse: (s, a) => {
      s.response = a.payload;
    },
    setError: (s, a) => {
      s.error = a.payload;
    }
  }
});
export const mentorMatchingActions = mentorMatchingSlice.actions;
