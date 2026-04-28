import api from './api';
import { ENDPOINTS } from '../constants/Config';

export const authService = {
  /**
   * Petición de inicio de sesión
   */
  login: async (credentials) => {
    // credentials: { email, password }
    const response = await api.post(ENDPOINTS.LOGIN, credentials);
    return response.data; 
  },

  /**
   * Petición de registro 
   */
  register: async (userData) => {
    const response = await api.post(ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  /**
   * Petición de refresh de token (opcional si ya está en el interceptor, 
   * pero útil para validaciones manuales)
   */
  refreshToken: async (token) => {
    const response = await api.post(ENDPOINTS.REFRESH_SESSION, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Notificar cierre de sesión al backend
   */
  logout: async () => {
    return await api.post(ENDPOINTS.LOGOUT);
  }
};