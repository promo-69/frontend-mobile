import api from './api';

/**
 * Paso 1 del flujo de compra.
 * Abre una sesión de compra en Redis (TTL 10 min).
 * Debe llamarse antes de checkout.
 * @param {number} cinemaId
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
 * Paso 3 del flujo de compra (arquitectura ASÍNCRONA).
 *
 * El endpoint recibe un ARREGLO de pagos (permite pagos divididos, ej. mitad
 * en Cinepuntos y mitad en transferencia). El backend hace validaciones
 * estructurales, ENCOLA el pago en un worker y responde de inmediato con un
 * mensaje ("Se está procesando el pago" o "Se está realizando el pago" cuando
 * hay un POS involucrado).
 *
 * @param {Array<object>|object} payments - Arreglo de pagos (o un solo pago;
 *   se normaliza a arreglo). Se recomienda siempre enviar arreglo.
 * @returns {{ message: string }} Confirmación de que el pago se está procesando.
 */
export const registerPayment = async (payments) => {
  const body = Array.isArray(payments) ? payments : [payments];
  const response = await api.post('/orders/payments', body);
  return response.data.data;
};

// Consulta el estado de la sesión de compra activa (para recuperación).
export const getSessionState = async () => {
  const response = await api.get('/orders/session');
  return response.data.data;
};

// Consulta el detalle completo de la sesión activa (incluye orden y datos de moneda).
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
 * Si la orden viene de un canje de CinePuntos, el backend adjunta
 * `redemption` (premio canjeado) y `vouchers` (boleto en blanco / 2x1
 * emitidos), para poder recuperarlos después desde "Mis Compras".
 */
export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data.data;
};
