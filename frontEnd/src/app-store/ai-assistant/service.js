import { api } from '../../middlewares';

export const fetchAiStatusApi = () => api.get('/api/ai-assistant/status');
export const suggestReplyApi = (roomId) => api.post(`/api/ai-assistant/rooms/${roomId}/suggest-reply`);
export const summarizeRoomApi = (roomId) => api.post(`/api/ai-assistant/rooms/${roomId}/summary`);
