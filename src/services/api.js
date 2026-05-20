import axios from 'axios';
import { ENDPOINTS, ENV, HEADERS } from '../constants/config';
import { storageHelper } from '../helper/storage.helper';
// Crear la instancia base
const api = axios.create({
  baseURL: ENV.API_URL,
  headers: HEADERS.JSON,
});

//  Interceptor de Peticiones: Inyectar el Bearer Token
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

// Interceptor de Respuestas: Manejo de errores y refresh
api.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa, pasarla tal cual
  async (error) => {
    const originalRequest = error.config;

    // Registrar errores de conexión o respuesta
    if (error.response) {
      console.error('Error de respuesta:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error('Error de conexión:', error.request);
    } else {
      console.error('Error desconocido:', error.message);
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
          { Authorization: `${HEADERS.AUTH_PREFIX} ${refreshToken}` }
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
    const response = await axios.get('http://backend-jog6.onrender.com/health');
    return response.data; // Return the response data if successful
  } catch (error) {
    console.error('Health check failed:', error);
    throw error; // Re-throw the error for further handling
  }
};

export default api;