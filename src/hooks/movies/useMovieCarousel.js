import { useEffect, useState } from 'react';
import { getActiveMovies } from '../../services/movies.service';

export const normalizeMovieCarouselItem = (item) => {
  const movie = item?.movie || item;
  const posterUrl =
    movie?.posterUrl || movie?.poster_url || movie?.poster || null;
  const bannerUrl =
    movie?.bannerUrl || movie?.banner_url || movie?.banner || posterUrl || null;

  return {
    id: movie?.id,
    title: movie?.title,
    synopsis: movie?.synopsis || `Disfruta de "${movie?.title}"...`,
    posterUrl,
    bannerUrl,
    poster_url: posterUrl,
    banner_url: bannerUrl,
    tag:
      movie?.age_classification?.description ||
      movie?.classification ||
      'Regular',
    duration: movie?.duration_minutes
      ? `${movie?.duration_minutes} min`
      : '— min',
  };
};

export const useMovieCarousel = () => {
  const [movies, setMovies] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const response = await getActiveMovies();
        const data = response?.data || response || [];

        const normalized = data.map(normalizeMovieCarouselItem);
        setMovies(normalized);
      } catch (err) {
        console.error('Error en peliculas en carousel:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const next = () =>
    setCurrent((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
  const prev = () =>
    setCurrent((prev) => (prev === 0 ? movies.length - 1 : prev - 1));

  // El timer se reinicia cada vez que cambia 'current' o 'movies'
  useEffect(() => {
    if (movies.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [current, movies.length]);

  return { movies, current, loading, next, prev };
};
