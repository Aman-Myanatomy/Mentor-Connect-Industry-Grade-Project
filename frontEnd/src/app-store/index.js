import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { aiAssistantSlice } from './ai-assistant/slice';
import { chatSlice } from './chat/slice';
import { loginSlice } from './login/slice';
import { mentorDirectorySlice } from './mentor-directory/slice';
import { mentorMatchingSlice } from './mentor-matching/slice';

const appReducer = combineReducers({
  login: loginSlice.reducer,
  mentorMatching: mentorMatchingSlice.reducer,
  mentorDirectory: mentorDirectorySlice.reducer,
  chat: chatSlice.reducer,
  aiAssistant: aiAssistantSlice.reducer
});

// 'app/reset' (dispatched on logout) returns every slice to its initial state.
const rootReducer = (state, action) => appReducer(action.type === 'app/reset' ? undefined : state, action);

export const store = configureStore({ reducer: rootReducer });

export const useAppDispatch = useDispatch.withTypes();
export const useAppSelector = useSelector.withTypes();
