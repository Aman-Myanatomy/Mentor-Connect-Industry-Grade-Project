import axios from 'axios';
import { N_CONF } from '../constants';
import { tokenStore } from '../utils';

const instance = axios.create({ baseURL: N_CONF.API_URL, timeout: 40_000 });

instance.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Back-end errors look like { success:false, errors:[{message}] } -> surface the first message.
instance.interceptors.response.use(
  (r) => r,
  (error) => Promise.reject(new Error(error.response?.data?.errors?.[0]?.message ?? error.message))
);

// Small helpers: services return the API envelope { success, data }.
export const api = {
  get: (url) => instance.get(url).then((r) => r.data),
  post: (url, body) => instance.post(url, body).then((r) => r.data)
};
