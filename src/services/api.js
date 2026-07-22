import axios from 'axios';
import { ENV } from '../constants/config';
import { getDeviceId } from '../helper/device.helper';
import { storageHelper } from '../helper/storage.helper';

const api = axios.create({
  baseURL: ENV.API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

//  Interceptor de Peticiones
api.interceptors.request.use(
  async (config) => {
    config.headers['x-client-channel'] = 'mobile';
    config.headers['x-device-id'] = await getDeviceId();
    const token = await storageHelper.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/signup')
    ) {
      return Promise.reject(error);
    }

    if (error.response && !originalRequest?.suppressErrorLog) {
      console.error('[Axios Error Response]:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
      });
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await storageHelper.getRefreshToken();

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          `${ENV.API_URL}/auth/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
          }
        );

        const res = response.data?.data ?? response.data ?? {};

        const accessToken = res?.tokens?.accessToken || null;
        const newRefreshToken = res?.tokens?.refreshToken || null;

        if (!accessToken) {
          throw new Error('Refresh response did not include an access token');
        }

        const freshUser = res?.user ?? null;
        await storageHelper.saveSession(
          accessToken,
          newRefreshToken ?? null,
          freshUser
        );

        try {
          const { reauthenticateSocket } = await import('./socket.service');
          await reauthenticateSocket();
        } catch {
          // Si el socket no está disponible, el próximo getSocket usará el
          // token fresco de todas formas.
        }

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Error al intentar refrescar el token:', refreshError);
        await storageHelper.clearSession();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const checkHealth = async () => {
  try {
    const response = await axios.get(ENV.API_URL);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export default api;
