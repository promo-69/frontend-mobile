import api from './api';

/**
 * Obtiene la lista de todas las funciones (showtimes) disponibles a nivel global.
 */
export const getShowtimesByCinema = async (cinemaId) => {
  const res = await api.get(`/cinemas/${cinemaId}/showtimes`);
  return res.data.data;
};

/**
 * Obtiene las funciones disponibles para una película específica.
 * @param {string|number} movieId - ID de la película.
 */
export const getShowtimesByMovie = async (movieId) => {
  const response = await api.get(`/showtimes?movieId=${movieId}`);
  return response.data.data;
};

/**
 * Obtiene las funciones disponibles para una película específica en un cine específico.
 * @param {string|number} movieId - ID de la película.
 * @param {string|number} cinemaId - ID del cine.
 */
export const getShowtimesByMovieAndCinema = async (movieId, cinemaId) => {
  const response = await api.get(
    `/showtimes?movieId=${movieId}&cinemaId=${cinemaId}`
  );
  return response.data.data;
};

/**
 * Obtiene el detalle de una función específica por su ID.
 * @param {string|number} showtimeId - ID de la función.
 */
export const getShowtimeById = async (showtimeId) => {
  const response = await api.get(`/showtimes/${showtimeId}`);
  return response.data.data;
};

/**
 * Obtiene la disponibilidad de asientos para una función específica.
 * @param {string|number} showtimeId - ID de la función.
 */
export const getShowtimeSeats = async (showtimeId) => {
  const response = await api.get(`/showtimes/${showtimeId}/seats`);
  return response.data.data;
};

