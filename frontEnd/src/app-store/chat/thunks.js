import { MESSAGE_KIND, SOCKET_EVENTS, SOCKET_STATUS } from '../../enumerations';
import { closeSocket, getSocket, openSocket } from '../../middlewares';

import { aiAssistantActions } from '../ai-assistant/slice';
import { createRoomApi, fetchMessagesApi, fetchRoomsApi } from './service';

import { chatActions } from './slice';

export const fetchRoomsThunk = () => async (dispatch) => {
  try {
    dispatch(chatActions.setRooms((await fetchRoomsApi()).data.rooms));
  } catch (e) {
    dispatch(chatActions.setError(e.message));
  }
};

export const openRoomThunk = (roomId) => async (dispatch) => {
  dispatch(chatActions.setActiveRoomId(roomId));
  dispatch(chatActions.setDraft(''));
  dispatch(aiAssistantActions.reset()); // AI output belongs to one conversation
  dispatch(chatActions.setIsLoadingMessages(true));
  try {
    dispatch(chatActions.setMessages({ roomId, messages: (await fetchMessagesApi(roomId)).data.messages }));
  } catch (e) {
    dispatch(chatActions.setError(e.message));
  } finally {
    dispatch(chatActions.setIsLoadingMessages(false));
  }
};

export const startChatWithMentorThunk = (mentorId) => async (dispatch) => {
  try {
    const { roomId } = (await createRoomApi(mentorId)).data;
    await dispatch(fetchRoomsThunk());
    await dispatch(openRoomThunk(roomId));
  } catch (e) {
    dispatch(chatActions.setError(e.message));
  }
};

// Socket events -> Redux actions. Components never touch the socket directly.
const typingTimers = {};

export const connectChatSocketThunk = (token) => (dispatch, getState) => {
  const socket = openSocket(token);
  socket.on('connect', () => dispatch(chatActions.setSocketStatus(SOCKET_STATUS.CONNECTED)));
  socket.on('disconnect', () => dispatch(chatActions.setSocketStatus(SOCKET_STATUS.DISCONNECTED)));
  socket.on('connect_error', () => dispatch(chatActions.setSocketStatus(SOCKET_STATUS.ERROR)));
  socket.on(SOCKET_EVENTS.TYPING, (e) => {
    if (e.userId === getState().login.user?.id) return;
    window.clearTimeout(typingTimers[e.roomId]);
    dispatch(chatActions.setTyping({ roomId: e.roomId, name: e.isTyping ? e.name : null }));
    // Safety net: if the "stopped typing" event is lost, clear it ourselves.
    if (e.isTyping)
      typingTimers[e.roomId] = window.setTimeout(() => dispatch(chatActions.setTyping({ roomId: e.roomId, name: null })), 6000);
  });
  socket.on(SOCKET_EVENTS.NEW_MESSAGE, (m) => {
    dispatch(chatActions.messageReceived(m));
    const st = getState();
    if (m.roomId !== st.chat.activeRoomId && m.senderId !== st.login.user?.id) dispatch(chatActions.incrementUnread(m.roomId));
  });
  socket.on(SOCKET_EVENTS.PRESENCE, (e) => dispatch(chatActions.setPresence(e)));
  socket.on(SOCKET_EVENTS.ROOMS_CHANGED, () => {
    void dispatch(fetchRoomsThunk());
  });
};

export const disconnectChatSocketThunk = () => (dispatch) => {
  closeSocket();
  dispatch(chatActions.setSocketStatus(SOCKET_STATUS.DISCONNECTED));
};

export const sendMessageThunk =
  (body, kind = MESSAGE_KIND.TEXT) =>
  (dispatch, getState) => {
    const roomId = getState().chat.activeRoomId;
    const socket = getSocket();
    if (!roomId || !socket) return Promise.resolve();
    return new Promise((resolve) => {
      socket.emit(SOCKET_EVENTS.SEND_MESSAGE, { roomId, body, kind }, (res) => {
        dispatch(chatActions.setError(res.error ?? null));
        if (!res.error && kind === MESSAGE_KIND.TEXT) dispatch(chatActions.setDraft('')); // a shared meeting link must not wipe what you were typing
        resolve();
      });
    });
  };

// Tell the other person we are (not) typing. The server relays it; nothing is stored.
export const emitTypingThunk = (isTyping) => (_dispatch, getState) => {
  const roomId = getState().chat.activeRoomId;
  if (roomId) getSocket()?.emit(SOCKET_EVENTS.TYPING, { roomId, isTyping });
};
