import api from './api';

/**
 *
 * @returns {Promise<Array>}
 */
export const getPaymentOptions = async () => {
  const response = await api.get('/payments/options');
  return response.data.data;
};

/**

 * @param {Array} options
 * @param {number} paymentMethodId
 * @returns {Array}
 */
export const getAccountsForMethod = (options, paymentMethodId) => {
  if (!Array.isArray(options)) return [];
  const method = options.find((m) => Number(m.id) === Number(paymentMethodId));
  if (!method || !Array.isArray(method._BankAccounts)) return [];
  return method._BankAccounts;
};
