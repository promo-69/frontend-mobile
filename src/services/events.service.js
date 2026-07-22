import api from './api';

// Obtener eventos próximos (paginados)
export const getEvents = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/special-events?page=${page}&limit=${limit}`);
    if (response?.data?.success) {
      const rawData = response.data.data;
      const array = Array.isArray(rawData) ? rawData : rawData?.data || [];
      return {
        items: array,
        metadata: response.data.metadata || null,
      };
    }
    return { items: [], metadata: null };
  } catch (error) {
    console.error('Error en getEvents:', error.message);
    return { items: [], metadata: null };
  }
};

// Obtener la informacion del Evento con el id - Mary
export const getEventById = async (eventId) => {
  const response = await api.get(`/special-events/${eventId}`);
  return response.data.data;
};

// De un evento, obtengo las sucursales y funciones disponibles - Mary
export const getCinemaShowtimebyDate = async (eventId, date) => {
  const response = await api.get(`/showtimes/by-content/event/${eventId}/`, {
    params: { date },
  });
  return response.data.data;
};
