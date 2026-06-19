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
  changePassword: async (data) => {
    const response = await api.patch('/users/me/security', data);
    return response.data;
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
};
