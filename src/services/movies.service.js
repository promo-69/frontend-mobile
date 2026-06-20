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

export const getMoviesReleases = async (page = 1, limit = 10) => {
  try{
  
  const response = await api.get(`/movies/showtimes?page=${page}&limit=${limit}`);

  if (response?.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  }
  catch (error) {
    console.error('Error en getMoviesReleases:', error.message);
    return [];
  }

 
};

export const getUpcomingMovies = async (page = 1, limit = 10) => {
  try{
  const response = await api.get(`/movies/upcoming?page=${page}&limit=${limit}`);
  if (response?.data?.success) {
      return response.data.data;
    }
    return [];
  }
  catch (error){
    console.error('Error en getUpcomingMovies:', error.message);
    return [];
  }
};
