import api from './api';

export const authService = {
  /**
   * Petición de inicio de sesión
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Petición de registro
   */
  signUp: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  verifyEmail: async ({ email, code }) => {
    const response = await api.post('/auth/verify-signup', { email, code });
    return response.data;
  },
  // ---------------------------------------------------------
  // Recuperar Contraseña: Paso 1 — Enviar correo
  // ---------------------------------------------------------
  sendRecoveryEmailRequest: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // ---------------------------------------------------------
  // RECOVERY: Paso 2 — Validar código
  // ---------------------------------------------------------
  verifyRecoveryCodeRequest: async (email, code) => {
    const response = await api.post('/auth/verify-reset-code', { email, code });
    return response.data;
  },

  // ---------------------------------------------------------
  // RECOVERY: Paso 3 — Guardar nueva contraseña
  // ---------------------------------------------------------
  resetPasswordRequest: async ({ email, newPassword }) => {
    const response = await api.post('/auth/reset-password', {
      email,
      newPassword,
    });
    return response.data;
  },
  /**
   * Petición de refresh de token (opcional si ya está en el interceptor,
   * pero útil para validaciones manuales)
   */
  refreshToken: async (token) => {
    const response = await api.post(
      '/auth/refresh',
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Notificar cierre de sesión al backend
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};
