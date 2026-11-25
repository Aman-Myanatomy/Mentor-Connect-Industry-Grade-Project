// Real-time chat. A socket is a long-lived connection, so: authenticate ONCE at the handshake,
// authorize on EVERY event, and rate-limit per socket.
import http from 'node:http';
import { Server, Socket } from 'socket.io';
import { SOCKET_MESSAGES_PER_WINDOW, SOCKET_WINDOW_MS } from '../constants';
import { socketServerOptions } from '../config';
import { MESSAGE_KIND, SOCKET_EVENTS, USER_ROLE } from '../enumerations';
import { IUserPublic } from '../interfaces';
import * as Services from '../services';
import { logger } from '../utils';
import { parseSocketMessage } from '../validation';
import { maybeAutoReply } from './demo-mentor';

// Created un-attached so controllers can import `io` and emit; attached to the HTTP server in setupWebSockets().
export const io = new Server(socketServerOptions);

type Ack = (res: { ok?: true; error?: string }) => void;

export const setupWebSockets = (httpServer: http.Server): void => {
  io.attach(httpServer);

  // Handshake auth: token comes from socket.handshake.auth (sent by the front-end), same JWT as REST.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (typeof token !== 'string') throw new Error('no token');
      socket.data.user = await Services.authenticateToken(token);
      next();
    } catch { next(new Error('unauthorized')); }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as IUserPublic;
    socket.join(`user:${user.id}`);                                   // personal channel (notifications)
    // Register handlers SYNCHRONOUSLY; only the room joins are async. (An `await` before socket.on()
    // would drop events the client emits right after connecting.)
    const joined = Services.listRoomIdsForUser(user.id).then((ids) => {
      ids.forEach((id) => socket.join(`room:${id}`));
      socket.data.roomIds = ids;
      ids.forEach((id) => socket.to(`room:${id}`).emit(SOCKET_EVENTS.PRESENCE, { userId: user.id, online: true }));   // tell the people you chat with
    });
    socket.on('disconnect', async () => {
      await joined.catch(() => undefined);
      if ((await io.in(`user:${user.id}`).fetchSockets()).length > 0) return;       // still connected from another tab/device
      (socket.data.roomIds as string[] | undefined)?.forEach((id) => io.to(`room:${id}`).emit(SOCKET_EVENTS.PRESENCE, { userId: user.id, online: false }));
    });

    // Typing indicator: relayed to the OTHER member(s) of a room you belong to. Nothing is stored.
    socket.on(SOCKET_EVENTS.TYPING, async (payload: unknown) => {
      const p = payload as { roomId?: unknown; isTyping?: unknown } | null;
      if (typeof p?.roomId !== 'string' || typeof p.isTyping !== 'boolean') return;
      await joined;
      if (!socket.rooms.has(`room:${p.roomId}`)) return;                  // must already be a member (joined at connect/room creation)
      socket.to(`room:${p.roomId}`).emit(SOCKET_EVENTS.TYPING, { roomId: p.roomId, userId: user.id, name: user.name, isTyping: p.isTyping });
    });

    let sentAt: number[] = [];                                        // sliding-window limiter, per socket
    socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (payload: unknown, ack: Ack = () => undefined) => {
      try {
        await joined;
        const now = Date.now();
        sentAt = sentAt.filter((t) => now - t < SOCKET_WINDOW_MS);
        if (sentAt.length >= SOCKET_MESSAGES_PER_WINDOW) return ack({ error: 'You are sending messages too fast' });
        sentAt.push(now);

        const msg = parseSocketMessage(payload);
        if (!msg) return ack({ error: 'Invalid message' });
        if (!(await Services.isRoomMember(msg.roomId, user.id))) return ack({ error: 'Not allowed' });   // authorize EVERY event

        const saved = await Services.saveMessage(msg.roomId, user, msg.body, { kind: msg.kind });
        io.to(`room:${msg.roomId}`).emit(SOCKET_EVENTS.NEW_MESSAGE, saved);
        ack({ ok: true });
        if (user.role === USER_ROLE.STUDENT && msg.kind === MESSAGE_KIND.TEXT) void maybeAutoReply(io, msg.roomId);   // the AI persona never answers a meeting link   // no-op unless DEMO_AUTO_REPLY and mentor offline
      } catch (e) {
        logger.error('socket send-message failed', e);
        ack({ error: 'Failed to send' });
      }
    });
  });
};
