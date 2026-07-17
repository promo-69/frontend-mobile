import api from './api';

/**
 * Paso 1 del flujo de compra.
 * @param {number} cinemaId  - ID de la sucursal
 */
export const createQuote = async (cinemaId) => {
  const response = await api.post('/orders/quote', { cinema: cinemaId });
  return response.data.data;
};

/**
 * Paso 2 del flujo de compra.
 * @param {Array} tickets
 * @param {Array} concessions
 * @returns {{ subtotal_base_currency, total_amount_base_currency }}
 */
export const processCheckout = async (tickets, concessions) => {
  const response = await api.post('/orders/checkout', { tickets, concessions });
  return response.data.data;
};

/**
 * Paso 3 del flujo de compra (arquitectura ASÍNCRONA).
 *
 * @param {Array<object>|object} payments
 * @returns {{ message: string }}
 */
export const registerPayment = async (payments) => {
  const body = Array.isArray(payments) ? payments : [payments];
  const response = await api.post('/orders/payments', body);
  return response.data.data;
};

export const getSessionState = async () => {
  const response = await api.get('/orders/session', { suppressErrorLog: true });
  return response.data.data;
};

// Consulta el detalle completo de la sesión activa (incluye orden y datos de moneda).
export const getSessionDetails = async () => {
  const response = await api.get('/orders/session/details');
  return response.data.data;
};

export const cancelSession = async () => {
  try {
    const response = await api.delete('/orders/session', {
      suppressErrorLog: true,
    });
    return response.data.data;
  } catch (error) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data.data;
};
