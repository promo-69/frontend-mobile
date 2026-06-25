import api from './api';

// De un evento, obtengo las sucursales y funciones disponibles
export const getMoviesShowtimebyDateCinema = async (cinemaId, date) => {
  const response = await api.get(`/showtimes/billboard/full`, {
    params: {
      cinemaId,
      date,
    },
  });
  return response.data.data;
};

// Catalogo de lenguajes
export const getLanguages = async () => {
  const response = await api.get(`/catalogs/languages`);
  return response.data.data;
};

// Catalogo de Tipo de Proyecciones
export const getProjectionTypes = async () => {
  const response = await api.get(`/catalogs/projection-types`);
  return response.data.data;
};

// ─── Alquiler de salas ───────────────────────────────────────────────────────

// Lista de sucursales (cines)
export const getCinemasList = async () => {
  const response = await api.get('/cinemas');
  return response.data?.data ?? [];
};

// Salas disponibles de una sucursal
export const getRoomsByCinema = async (cinemaId) => {
  const response = await api.get(`/cinemas/${cinemaId}/rooms`);
  return response.data?.data ?? response.data ?? [];
};

// Catálogo de tipos de evento (booking-types) para el alquiler
export const getEventTypes = async () => {
  const response = await api.get('/catalogs/booking-types');
  return response.data?.data ?? [];
};

// Crea una solicitud de alquiler de sala
// payload: { room, event_type, event_name, event_description, event_date,
//            requested_start_time, requested_end_time, attendees }
export const createRoomRentalRequest = async (payload) => {
  const response = await api.post('/rentals/requests', payload);
  return response.data?.data ?? response.data;
};

// Lista las solicitudes de alquiler del usuario autenticado
export const getMyRentalRequests = async () => {
  const response = await api.get('/rentals/requests/me');
  return response.data?.data ?? [];
};
