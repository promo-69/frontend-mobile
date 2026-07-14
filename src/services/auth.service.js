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
   * Inicio de sesión de empleados (portero, cajero, gerentes).
   * Endpoint exclusivo para user_type = empleado.
   */
  loginAdmin: async (credentials) => {
    const response = await api.post('/auth/login/admin', credentials);
    return response.data;
  },

  /**
   * Devuelve los códigos de permiso del empleado autenticado
   * (ej. 'VIEW:ACCESS:QR'). Requiere sesión activa.
   */
  getPermissions: async () => {
    const response = await api.get('/auth/permissions');
    return response.data?.data?.permissions ?? [];
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
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // ---------------------------------------------------------
  // RECOVERY: Paso 2 — Validar código
  // ---------------------------------------------------------
  verifyResetCode: async ({ email, code }) => {
    const response = await api.post('/auth/verify-reset-code', { email, code });
    return response.data;
  },

  // ---------------------------------------------------------
  // RECOVERY: Paso 3 — Guardar nueva contraseña
  // ---------------------------------------------------------
  resetPassword: async ({ email, resetToken, newPassword }) => {
    const response = await api.post('/auth/reset-password', {
      email,
      resetToken,
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
