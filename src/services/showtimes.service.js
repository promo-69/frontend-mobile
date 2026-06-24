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

export const getContentDetails = async (type, id) => {
  // Evitamos llamadas si el ID es el string "undefined" o está vacío
  if (!id || id === 'undefined') throw new Error('ID de contenido no válido');

  const isEvent = type === 'event' || type === 'special_event';
  const endpoint = isEvent ? `/special-events/${id}` : `/movies/${id}`;

  const response = await api.get(endpoint);
  const data = response.data.data;

  // Adaptamos y normalizamos las propiedades para que el componente lea siempre lo mismo
  return {
    id: data?.id,
    title: data?.title,
    synopsis: isEvent ? data?.description : data?.synopsis,
    duration_minutes: data?.duration_minutes,
    age_classification: isEvent
      ? data?.age_classification_detail
      : data?.age_classification,
    lifecycle_state: isEvent
      ? data?.lifecycle_state_detail
      : data?.lifecycle_state,
    trailer_url: data?.trailer_url,
    poster_url: data?.poster_url,
    banner_url: data?.banner_url,
    release_date: data?.release_date,
    genres: data?.genres || [],
  };
};

/*Devuelve todos los horarios futuros de una película o evento especial específico, agrupados por cine.
Opcionalmente, filtra por una fecha específica.
Si no se proporciona una fecha, devuelve
los horarios de la fecha disponible más cercana.
Devuelve una lista de fechas disponibles.
*/
export const getContentShowtimes = async (type, id, date) => {
  const isEvent = type === 'event' || type === 'special_event';
  const contentType = isEvent ? 'event' : 'movie';

  if (!id || id === 'undefined') return null;

  const response = await api.get(`/showtimes/by-content/${contentType}/${id}`, {
    params: { date },
  });
  return response.data.data;
};
