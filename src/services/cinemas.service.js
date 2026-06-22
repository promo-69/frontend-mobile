import axios from 'axios';
import api from './api';
import { ENV } from '../constants/config';

// Instancia pública (sin interceptores de auth) para endpoints que no requieren sesión.
// Usar esta instancia evita que el interceptor de respuesta intente refrescar
// un token inexistente cuando el usuario no está autenticado.
const publicApi = axios.create({
  baseURL: ENV.API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// GET /cinemas — público, sin auth requerida.
// Respuesta del backend: { success, data: [...cinemas], metadata }
export const getCinemas = async (params = {}) => {
  const response = await publicApi.get('/cinemas', { params });
  // El wrapper del backend coloca el array en response.data.data
  const payload = response.data?.data ?? response.data;
  // Normalizar: puede ser array directo o { count, rows }
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.rows)) return payload.rows;
  return [];
};

// GET /cinemas/:id — público
export const getCinemaById = async (id) => {
  const response = await publicApi.get(`/cinemas/${id}`);
  return response.data.data || response.data;
};

// GET /cinemas/:cinemaId/showtimes/billboard — público
export const getCinemaBillboard = async (cinemaId, params = {}) => {
  const response = await api.get(`/cinemas/${cinemaId}/showtimes/billboard`, {
    params,
  });
  return response.data.data || [];
};
