import api from './api';

// Catálogo público completo de productos (sin cinemaId, sin stock check).
// Responde con pricing.final_price ya calculado por el backend.
export const getAllProducts = async () => {
  const response = await api.get('/concessions/products');
  return response.data.data || [];
};

// Catálogo público completo de combos (sin cinemaId, sin stock check).
export const getAllCombos = async () => {
  const response = await api.get('/concessions/combos');
  return response.data.data || [];
};

/**
 * Obtiene todos los productos disponibles (con stock) de la confitería.
 * Usado en el flujo de compra — requiere cinemaId.
 * @param {number|string} cinemaId - ID de la sucursal (requerido por el backend)
 */
export const getAvailableProducts = async (cinemaId) => {
  const response = await api.get('/concessions/products/available', {
    params: { cinemaId },
  });
  return response.data.data;
};

/**
 * Obtiene todos los combos disponibles (con stock) de la confitería.
 * Usado en el flujo de compra — requiere cinemaId.
 * @param {number|string} cinemaId - ID de la sucursal (requerido por el backend)
 */
export const getAvailableCombos = async (cinemaId) => {
  const response = await api.get('/concessions/combos/available', {
    params: { cinemaId },
  });
  return response.data.data;
};
