import { io } from 'socket.io-client';
import { N_CONF } from '../constants';

let socket = null;

export const openSocket = (token) => {
  socket?.disconnect();
  socket = io(N_CONF.API_URL, { auth: { token }, transports: ['websocket'] });
  return socket;
};
export const getSocket = () => socket;
export const closeSocket = () => {
  socket?.disconnect();
  socket = null;
};
