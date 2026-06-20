import axios from 'axios';
import { ENV } from '../constants/config';
import { storageHelper } from '../helper/storage.helper';
// Crear la instancia base
const api = axios.create({
  baseURL: ENV.API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

//  Interceptor de Peticiones: Inyectar el Bearer Token
api.interceptors.request.use(
  async (config) => {
  
    const token = await storageHelper.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuestas: Manejo de errores y refresh
api.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa, pasarla tal cual
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/signup')
    ) {
      return Promise.reject(error);
    }

    if (error.response) {
      console.error('[Axios Error Response]:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
      });
    }
    
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
        const response = await axios.post(`${ENV.API_URL}/auth/refresh`, {}, {
          headers:
          { Authorization: `Bearer ${refreshToken}` }
        });

        // Extraer tokens de forma defensiva (varios formatos posibles)
        const res = response.data?.data ?? response.data ?? {};

        const accessToken = res?.tokens?.accessToken || null;
        const newRefreshToken = res?.tokens?.refreshToken || null;       

        if (!accessToken) {
          throw new Error('Refresh response did not include an access token');
        }

        // Persistir tokens y datos frescos del usuario (loyaltyPoints, etc.)
        // respPayload = response.data.data → { user, tokens: { accessToken, refreshToken } }
        const freshUser = respPayload.user ?? null;
        await storageHelper.saveSession(accessToken, newRefreshToken ?? null, freshUser);

        // Actualizar el header de la petición original y reintentar
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh también falla, limpiar sesión y forzar logout
        console.error('Error al intentar refrescar el token:', refreshError);
        await storageHelper.clearSession();
        // Aquí podrías disparar un evento global o redirección al login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Function to check the health of the backend service
export const checkHealth = async () => {
  try {
    const response = await axios.get(ENV.API_URL);
    return response.data; // Return the response data if successful
  } catch (error) {
    console.error('Health check failed:', error);
    throw error; // Re-throw the error for further handling
  }
};

export default api;
