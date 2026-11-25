import { createSlice } from '@reduxjs/toolkit';

const initialState = { mentors: [], isLoading: false, error: null };

export const mentorDirectorySlice = createSlice({
  name: 'mentorDirectory',
  initialState,
  reducers: {
    setMentors: (s, a) => {
      s.mentors = a.payload;
    },
    setIsLoading: (s, a) => {
      s.isLoading = a.payload;
    },
    setError: (s, a) => {
      s.error = a.payload;
    }
  }
});
export const mentorDirectoryActions = mentorDirectorySlice.actions;
