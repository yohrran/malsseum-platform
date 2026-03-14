import axios from 'axios';
import { useAuthStore } from '../store/auth-store';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let isRedirecting = false;

const tryRefreshToken = async (): Promise<string | null> => {
  if (isRefreshing) return null;
  isRefreshing = true;
  try {
    const currentToken = useAuthStore.getState().token;
    if (!currentToken) return null;

    const { data } = await axios.post(
      `${apiClient.defaults.baseURL}/api/auth/refresh`,
      {},
      { headers: { Authorization: `Bearer ${currentToken}` } },
    );

    if (data.success && data.data?.token) {
      useAuthStore.getState().setAuth(data.data.token, data.data.user);
      return data.data.token;
    }
    return null;
  } catch {
    return null;
  } finally {
    isRefreshing = false;
  }
};

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      const newToken = await tryRefreshToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
    }

    if (err.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      useAuthStore.getState().logout();
      window.location.href = '/login';
      setTimeout(() => {
        isRedirecting = false;
      }, 3000);
    }

    return Promise.reject(err);
  },
);
