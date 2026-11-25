import { api } from '../../middlewares';

export const fetchRoomsApi = () => api.get('/api/chat/rooms');
export const createRoomApi = (mentorId) => api.post('/api/chat/rooms', { mentorId });
export const fetchMessagesApi = (roomId) => api.get(`/api/chat/rooms/${roomId}/messages`);
