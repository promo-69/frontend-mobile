import axios from 'axios';
import { storageHelper } from '../helper/storage.helper';

// Cambiar URL según el entorno
const BASE_URL = 'http://localhost:3000/api'; // Docker local
// const BASE_URL = 'https://cineflix-api.onrender.com/api'; // Producción Render

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Petición: Adjuntar JWT
api.interceptors.request.use(
  async (config) => {
    const token = await storageHelper.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuesta: Manejo Global de Errores (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storageHelper.clearSession();
      // El AuthContext detectará la falta de token y redirigirá
    }
    return Promise.reject(error);
  }
);

export default api;
