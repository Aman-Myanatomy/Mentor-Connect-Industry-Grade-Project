import { api } from '../../middlewares';

export const fetchMentorsApi = () => api.get('/api/mentors');
