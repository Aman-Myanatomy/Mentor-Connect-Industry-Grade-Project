import { api } from '../../middlewares';

export const loginApi = (email, password) => api.post('/api/auth-user/login', { email, password });
export const registerApi = (name, email, password) => api.post('/api/auth-user/register', { name, email, password });
export const getMeApi = () => api.get('/api/auth-user/me');
