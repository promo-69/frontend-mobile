import api from './api';

export const usersService = {
  // Peticion de obtener datos del usuarios logueado
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Petición de actualizar datos del usuario logueado
  updateProfile: async (data) => {
    const response = await api.patch('/users/me/profile', data);
    return response.data;
  },

  // Petición de actualizar contraseña del usuario logueado
  // (Nuevo) Verifica la contraseña actual y devuelve un token de seguridad
  verifySecurity: async (password) => {
    const response = await api.post('/users/me/security/verify', { password });
    return response.data;
  },

  // (Nuevo) Cambia la seguridad (password/email) usando el token obtenido
  changeSecurity: async ({
    securityChangeToken,
    newPassword,
    newEmail,
  } = {}) => {
    const payload = { securityChangeToken };
    if (newPassword !== undefined) payload.newPassword = newPassword;
    if (newEmail !== undefined) payload.newEmail = newEmail;
    const response = await api.post('/users/me/security/change', payload);
    return response.data;
  },

  // Compatibilidad: alias al nuevo método
  changePassword: async (data) => {
    return await usersService.changeSecurity(data);
  },

  /**
   * Obtiene el historial de órdenes del usuario autenticado.
   * @param {Object} params - Filtros opcionales: from, to, limit, offset
   * @returns {{ rows: Order[], count: number }}
   */
  getMyOrders: async (params = {}) => {
    const response = await api.get('/users/me/orders', { params });
    return response.data.data;
  },

  /**
   * Obtiene los tickets de una orden específica del usuario.
   * @param {number} orderId
   */
  getMyOrderTicket: async (orderId) => {
    const response = await api.get(`/users/me/orders/${orderId}/ticket`);
    return response.data.data;
  },
  /**
   * Obtiene info de lealtad del usuario: nivel, puntos y balance.
   * @returns {{ loyalty_level, loyalty_level_name, level_progress_points, points_balance }}
   */
  getLoyaltyInfo: async () => {
    const response = await api.get('/users/me/loyalty');
    return response.data.data;
  },

  /**
   * Obtiene el historial contable de movimientos de puntos (ganados y canjeados), paginado.
   * @param {Object} params - Filtros opcionales: page, limit
   * @returns {{ rows: LoyaltyLedger[], count: number }}
   */
  getLoyaltyLedgers: async (params = {}) => {
    const response = await api.get('/users/me/loyalty/ledgers', { params });
    return response.data.data;
  },

  /**
   * Obtiene la escalera completa de niveles de lealtad junto con el progreso
   * del usuario hacia el siguiente nivel.
   * @returns {{ levels, current_level, next_level, level_progress_points, points_to_next_level }}
   */
  getLoyaltyLevels: async () => {
    const response = await api.get('/users/me/loyalty/levels');
    return response.data.data;
  },

  /**
   * Obtiene el detalle completo de una orden específica (no descarga todas las órdenes).
   * @param {number|string} orderId
   */
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.data;
  },

  /**
   * Obtiene las suscripciones a alertas de preventa del usuario (paginado).
   * @param {Object} params
   */
  getMyMovieSubscriptions: async (params = {}) => {
    const response = await api.get('/users/me/movie-subscriptions', { params });
    return response.data.data;
  },

  /**
   * Verifica si el usuario ya está suscripto a una película específica.
   * Lanza 404 si no existe la suscripción (no se trata como error real).
   * @param {number|string} movieId
   */
  getMyMovieSubscriptionById: async (movieId) => {
    const response = await api.get(`/users/me/movie-subscriptions/${movieId}`);
    return response.data.data;
  },

  /**
   * Crea una suscripción para recibir alerta cuando la película entre en preventa/estreno.
   * @param {number|string} movieId
   */
  subscribeToMovie: async (movieId) => {
    const response = await api.post('/users/me/movie-subscriptions', {
      movieId,
    });
    return response.data.data;
  },

  /**
   * Cancela la suscripción de alerta de preventa de una película.
   * @param {number|string} movieId
   */
  unsubscribeFromMovie: async (movieId) => {
    const response = await api.delete(
      `/users/me/movie-subscriptions/${movieId}`
    );
    return response.data.data;
  },
};
