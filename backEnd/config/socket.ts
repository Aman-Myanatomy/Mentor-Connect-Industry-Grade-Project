import { ServerOptions } from 'socket.io';
import { SOCKET_MAX_PAYLOAD_BYTES } from '../constants';
import { N_CONF } from './env';

// Tiny payload cap => no giant-message DoS; same single allowed origin as the REST API.
export const socketServerOptions: Partial<ServerOptions> = {
  maxHttpBufferSize: SOCKET_MAX_PAYLOAD_BYTES,
  cors: { origin: N_CONF.FRONTEND_URL }
};
