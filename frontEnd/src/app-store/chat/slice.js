import { createSlice } from '@reduxjs/toolkit';
import { SOCKET_STATUS } from '../../enumerations';

const initialState = {
  rooms: [],
  activeRoomId: null,
  messagesByRoom: {},
  draft: '',
  unreadByRoom: {},
  typingByRoom: {},
  socketStatus: SOCKET_STATUS.DISCONNECTED,
  isLoadingMessages: false,
  error: null
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setRooms: (s, a) => {
      s.rooms = a.payload;
    },
    setActiveRoomId: (s, a) => {
      s.activeRoomId = a.payload;
      if (a.payload) delete s.unreadByRoom[a.payload];
    },
    incrementUnread: (s, a) => {
      s.unreadByRoom[a.payload] = (s.unreadByRoom[a.payload] ?? 0) + 1;
    },
    setPresence: (s, a) => {
      s.rooms.forEach((r) => {
        if (r.otherId === a.payload.userId) r.otherOnline = a.payload.online;
      });
    },
    setMessages: (s, a) => {
      s.messagesByRoom[a.payload.roomId] = a.payload.messages;
    },
    messageReceived: (s, a) => {
      const list = (s.messagesByRoom[a.payload.roomId] ??= []);
      if (!list.some((m) => m.id === a.payload.id)) list.push(a.payload); // dedupe (history fetch vs live event)
      s.typingByRoom[a.payload.roomId] = null; // they sent it, so they stopped typing
      const room = s.rooms.find((r) => r.id === a.payload.roomId); // keep the conversation list preview fresh
      if (room)
        room.lastMessage = {
          body: a.payload.body,
          kind: a.payload.kind ?? 'text',
          senderId: a.payload.senderId,
          createdAt: a.payload.createdAt
        };
    },
    setTyping: (s, a) => {
      s.typingByRoom[a.payload.roomId] = a.payload.name;
    },
    setDraft: (s, a) => {
      s.draft = a.payload;
    },
    setSocketStatus: (s, a) => {
      s.socketStatus = a.payload;
    },
    setIsLoadingMessages: (s, a) => {
      s.isLoadingMessages = a.payload;
    },
    setError: (s, a) => {
      s.error = a.payload;
    }
  }
});
export const chatActions = chatSlice.actions;
