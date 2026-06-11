import api from './api';

/**
 * Paso 1 del flujo de compra.
 * Abre una sesión de compra en Redis (TTL 10 min).
 * Debe llamarse antes de checkout.
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
 *
 * @param {Array} tickets
 * @param {Array} concessions
 * @returns {{ subtotal_base_currency, total_amount_base_currency }}
 */
export const processCheckout = async (tickets, concessions) => {
  const response = await api.post('/orders/checkout', { tickets, concessions });
  return response.data.data;
};

/**
 * Paso 3 del flujo de compra.
 * Registra el pago de la orden activa en sesión.
 * El backend genera el QR JWT y emite payment_success por Socket.io.
 *
 * @param {{ payment_method, amount, currency?, reference_number? }} paymentData
 * @returns {Object} orderData con qr_code y order_status
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

// Cancela la sesión de compra activa y libera los asientos bloqueados.
export const cancelSession = async () => {
  const response = await api.delete('/orders/session');
  return response.data.data;
};
