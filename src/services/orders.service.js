import api from './api';

/**
 * Paso 1 del flujo de compra.
 * Abre una sesión de compra en Redis (TTL 10 min).
 * @param {number} cinemaId  - ID de la sucursal
 */
export const createQuote = async (cinemaId) => {
  const response = await api.post('/orders/quote', { cinema: cinemaId });
  return response.data.data;
};

/**
 * Paso 2 del flujo de compra.
 * Envía los tickets y concesiones al backend para calcular precios reales
 * (modificadores, impuestos, tipo de cambio) y crear la orden en BD.
 */
export const processCheckout = async (tickets, concessions) => {
  const response = await api.post('/orders/checkout', { tickets, concessions });
  return response.data.data;
};

/**
 * Paso 3 del flujo de compra.
 * Registra el pago de la orden activa en sesión.
 */
export const registerPayment = async (paymentData) => {
  const response = await api.post('/orders/payments', paymentData);
  return response.data.data;
};

// Consulta el estado de la sesión de compra activa (para recuperación).
export const getSessionState = async () => {
  const response = await api.get('/orders/session');
  return response.data.data;
};

// Consulta el detalle completo de la sesión activa.
export const getSessionDetails = async () => {
  const response = await api.get('/orders/session/details');
  return response.data.data;
};

// Cancela la sesión de compra activa y libera los asientos bloqueados.
export const cancelSession = async () => {
  const response = await api.delete('/orders/session');
  return response.data.data;
};

/**
 * Detalle de una orden puntual (GET /orders/:id).
 */
export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data.data;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Cancela la sesión de compra reintentando ante fallos transitorios.
 * @param {number} retries
 * @param {number} backoffMs
 */
export const cancelSessionWithRetries = async (retries = 3, backoffMs = 800) => {
  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await cancelSession();
    } catch (error) {
      if (error?.response?.status === 404) return null;
      lastError = error;
      if (attempt === retries) break;
      await sleep(backoffMs * attempt);
    }
  }

  throw lastError;
};
