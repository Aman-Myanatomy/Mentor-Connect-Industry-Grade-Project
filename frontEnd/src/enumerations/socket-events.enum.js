// Keep in sync with back-end/enumerations/socket-events.enums.ts
export const SOCKET_EVENTS = Object.freeze({
  SEND_MESSAGE: 'chat:send-message',
  NEW_MESSAGE: 'chat:new-message',
  ROOMS_CHANGED: 'chat:rooms-changed',
  TYPING: 'chat:typing',
  PRESENCE: 'chat:presence'
});
export const SOCKET_STATUS = Object.freeze({ DISCONNECTED: 'disconnected', CONNECTED: 'connected', ERROR: 'error' });
