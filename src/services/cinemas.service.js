import api from './api';

//GET - Toda la lista de Sucursales
export const getCinemas = async (params = {}) => {
  const response = await api.get('/cinemas', { params: { limit: 200, ...params } });
  return response.data;
};

//GET - Detalle de una sucursal por ID
export const getCinemaById = async (id) => {
  const response = await api.get(`/cinemas/${id}`);
  return response.data.data || response.data;
};

//GET - Cartelera específica de una sucursal
export const getCinemaBillboard = async (cinemaId, params = {}) => {
  const response = await api.get(`/cinemas/${cinemaId}/showtimes/billboard`, {
    params,
  });
  return response.data.data || [];
};
