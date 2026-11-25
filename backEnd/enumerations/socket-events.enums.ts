// Keep in sync with front-end/src/enumerations/socket-events.enum.ts
export enum SOCKET_EVENTS {
  SEND_MESSAGE = 'chat:send-message',
  NEW_MESSAGE = 'chat:new-message',
  ROOMS_CHANGED = 'chat:rooms-changed',
  TYPING = 'chat:typing',
  PRESENCE = 'chat:presence'
}
