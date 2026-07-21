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
   * Obtiene el historial de movimientos de puntos (loyalty ledgers).
   * Cada movimiento trae el tipo de operación (_OperationTypes con is_increment)
   * para saber si suma o resta puntos.
   * @param {Object} params - Filtros opcionales: limit, offset
   * @returns {{ rows: Ledger[], count: number } | Ledger[]}
   */
  getLoyaltyLedgers: async (params = {}) => {
    const response = await api.get('/users/me/loyalty/ledgers', { params });
    return response.data.data;
  },

  /**
   * Obtiene la tabla de niveles de fidelidad y el progreso del usuario.
   * @returns {{ levels, current_level, next_level, level_progress_points, points_to_next_level }}
   */
  getLoyaltyLevels: async () => {
    const response = await api.get('/users/me/loyalty/levels');
    return response.data.data;
  },

  // ─── Suscripción a alertas de preventa (películas "Próximamente") ───────────

  /**
     * Lista todas las películas suscritas por el usuario (con datos de la película).
     */
    getMyMovieSubscriptions: async () => {
      const response = await api.get('/users/me/movie-subscriptions');
      return response.data.data;
  },

  /**
   * Consulta si el usuario está suscrito a las alertas de una película.
   * El backend devuelve 404 si no hay suscripción (se maneja en el hook).
   */
  getMyMovieSubscriptionById: async (movieId) => {
    const response = await api.get(`/users/me/movie-subscriptions/${movieId}`);
    return response.data.data;
  },

  /**
   * Suscribe al usuario a las alertas de estreno de una película.
   * @param {number|string} movieId
   */
  subscribeToMovie: async (movieId) => {
    const response = await api.post('/users/me/movie-subscriptions', {
      movieId: Number(movieId),
    });
    return response.data.data;
  },

  /**
   * Cancela la suscripción a las alertas de estreno de una película.
   * @param {number|string} movieId
   */
  unsubscribeFromMovie: async (movieId) => {
    const response = await api.delete(
      `/users/me/movie-subscriptions/${movieId}`
    );
    return response.data.data;
  },

  /**
   * Cancela suscripciones en lote.
   * @param {number[]} movieIds - Array de IDs de películas
   */
  unsubscribeFromMoviesBatch: async (movieIds) => {
    const response = await api.delete('/users/me/movie-subscriptions', {
      data: movieIds,
    });
    return response.data;
  },
};
