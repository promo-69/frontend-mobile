import api from './api';

//GET - Toda la lista de Sucursales
export const getCinemas = async (params = {}) => {
  const response = await api.get('/cinemas', { params });
  return response.data; // Devolvemos todo para conservar el objeto 'metadata'
};

//GET - Detalle de una sucursal por ID
export const getCinemaById = async (id) => {
  const response = await api.get(`/cinemas/${id}`);
  return response.data.data || response.data;
};

//GET - Cartelera específica de una sucursal
// con los mismos filtros opcionales (cinemaId, movieId, projectionType, language)
export const getCinemaBillboard = async (cinemaId, params = {}) => {
  const response = await api.get(`/cinemas/${cinemaId}/showtimes/billboard`, { params }); // Se cambió 'billboard' a 'showtimes'
  return response.data.data || [];
};
