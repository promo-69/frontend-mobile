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

export const getMoviesReleases = async () => {
  console.log('INICIANDO PETICIÓN SHOWTIMES');
  const response = await api.get('/movies/showtimes');
  console.log('RESPUESTA SHOWTIMES:', response);
  return response.data.data;
};

export const getUpcomingMovies = async () => {
  const response = await api.get('/movies/upcoming');
  return response.data.data;
};
