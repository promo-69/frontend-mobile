import api from './api';

/**
 *
 * @returns {Promise<Array>} métodos de pago con sus cuentas destino.
 */
export const getPaymentOptions = async () => {
  const response = await api.get('/payments/options');
  return response.data.data;
};

/**
 * Extrae, de la respuesta de getPaymentOptions, las cuentas destino asociadas
 * a un método de pago concreto (por su ID numérico).
 *
 * @param {Array} options - respuesta de getPaymentOptions()
 * @param {number} paymentMethodId - ID del método (PAYMENT_METHOD del backend)
 * @returns {Array} cuentas destino ({ id, bank, currency, payment_details, ... })
 */
export const getAccountsForMethod = (options, paymentMethodId) => {
  if (!Array.isArray(options)) return [];
  const method = options.find((m) => Number(m.id) === Number(paymentMethodId));
  if (!method || !Array.isArray(method._BankAccounts)) return [];
  return method._BankAccounts;
};
