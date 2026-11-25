import { api } from '../../middlewares';

export const matchMentorsApi = (goal) => api.post('/api/ai-assistant/match-mentors', { goal });
