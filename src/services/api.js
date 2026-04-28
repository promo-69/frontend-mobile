import axios from 'axios';
import { ENV, ENDPOINTS, HEADERS } from '../constants/Config';
import { storageHelper } from '../helper/storage.helper';

// 1. Crear la instancia base
const api = axios.create({
  baseURL: ENV.API_URL,
  timeout: ENV.TIMEOUT,
  headers: HEADERS.JSON,
});

// 2. Interceptor de Peticiones: Inyectar el Bearer Token
api.interceptors.request.use(
  async (config) => {
    const token = await storageHelper.getAccessToken();
    if (token) {
      config.headers.Authorization = `${HEADERS.AUTH_PREFIX} ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Interceptor de Respuestas: Manejo de errores y refresh
api.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa, pasarla tal cual
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 (No autorizado) y no hemos reintentado ya esta petición
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await storageHelper.getRefreshToken();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Intentar renovar el token usando el endpoint 
        // Nota: Usamos axios directamente para evitar bucles infinitos con la instancia 'api'
        const response = await axios.post(`${ENV.API_URL}${ENDPOINTS.REFRESH_SESSION}`, {}, {
          headers: { Authorization: `${HEADERS.AUTH_PREFIX} ${refreshToken}` }
        });

        // Los tokens vienen en data.data
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Guardar los nuevos tokens
        await storageHelper.saveTokens(accessToken, newRefreshToken);

        // Actualizar el header de la petición original y reintentar
        originalRequest.headers.Authorization = `${HEADERS.AUTH_PREFIX} ${accessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Si el refresh también falla, limpiar sesión y forzar logout
        await storageHelper.clearSession();
        // Aquí podrías disparar un evento global o redirección al login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;