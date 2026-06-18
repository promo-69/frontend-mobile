import api from './api';

export const getMovies = async () => {
  const response = await api.get('/movies');
  return response.data.data;
};

// /movies/showtimes Retrieve a paginated list of movies that currently have scheduled showtimes (cartelera).
export const getMoviesWithShowtimes = async (page = 1, limit = 10) => {
  const response = await api.get(
    `/movies/showtimes?page=${page}&limit=${limit}`
  );
  return response.data.data;
};

export const getMovieById = async (id) => {
  const response = await api.get(`/movies/${id}`);
  return response.data.data;
};

export const getShowtimesBillboard = async (page = 1, limit = 10) => {
  try {
    // Usamos el nuevo endpoint de cartelera completa
    const response = await api.get('/showtimes/billboard/full');

    if (response?.data?.success && Array.isArray(response.data.data)) {
      // Normalizamos la data para que el componente UI reciba una estructura plana y sepa el tipo
      return response.data.data.map((item) => {
        const isEvent = item.type === 'special_event';
        // Extraemos el contenido interno y nos aseguramos de que el ID esté en la raíz
        const content = isEvent ? item.event || item : item.movie || item;

        return {
          ...content,
          id: content.id, // Aseguramos el ID en la raíz
          contentType: isEvent ? 'event' : 'movie', // Normalizado para getContentDetails
        };
      });
    }
    return [];
  } catch (error) {
    console.error('Error en getShowtimesBillboard:', error.message);
    return [];
  }
};

export const getUpcomingMovies = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(
      `/movies/upcoming?page=${page}&limit=${limit}`
    );
    if (response?.data?.success) {
      const rawData = response.data.data;
      const array = Array.isArray(rawData) ? rawData : rawData?.data || [];

      // Aplanamos por si la estructura de próximos estrenos también viene anidada
      return array.map((movie) => ({
        ...(movie.movie || movie),
        contentType: 'movie',
      }));
    }
    return [];
  } catch (error) {
    console.error('Error en getUpcomingMovies:', error.message);
    return [];
  }
};
