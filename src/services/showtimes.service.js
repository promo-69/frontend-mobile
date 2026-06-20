import api from './api';

/**
 * Obtiene la lista de todas las funciones (showtimes) disponibles a nivel global
 */
export const getShowtimesByCinema = async (cinemaId) => {
  const res = await api.get(`/cinemas/${cinemaId}/showtimes`);
  return res.data.data;
};

/**
 * Obtiene las funciones disponibles para una película específica
 */
export const getShowtimesByMovie = async (movieId) => {
  const response = await api.get(`/showtimes?movieId=${movieId}`);
  return response.data.data;
};

/**
 * Obtiene las funciones disponibles para una película específica en un cine específico.
 */
export const getShowtimesByMovieAndCinema = async (movieId, cinemaId) => {
  const response = await api.get(
    `/cinemas/${cinemaId}/showtimes/movies/${movieId}`
  );
  return response.data.data;
};

/**
 * Obtiene el detalle de una función específica por su ID
 */
export const getShowtimeById = async (showtimeId) => {
  const response = await api.get(`/showtimes/${showtimeId}`);
  return response.data.data;
};

/**
 * Obtiene la disponibilidad de asientos para una función específica
 */
export const getShowtimeSeats = async (showtimeId) => {
  const response = await api.get(`/showtimes/${showtimeId}/seat-map`);
  return response.data.data;
};
