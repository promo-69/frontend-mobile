import { useState, useEffect } from 'react';
import { getActiveMovies } from '../../services/movies.service';

export const useMovieCarousel = () => {
  const [movies, setMovies] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const response = await getActiveMovies();
        const data = response?.data || response || [];
        
        const normalized = data.map((item) => {
          const m = item.movie || item;
          return {
            id: m.id,
            title: m.title,
            synopsis: m.synopsis || `Disfruta de "${m.title}"...`,
            poster: m.poster_url,
            banner: m.banner_url || m.poster_url,
            tag: m.age_classification?.description || m.classification || 'Regular',
            duration: m.duration_minutes ? `${m.duration_minutes} min` : '— min',
          };
        });
        setMovies(normalized);
      } catch (err) {
        console.error('Error en peliculas en carousel:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const next = () => setCurrent(prev => (prev === movies.length - 1 ? 0 : prev + 1));
  const prev = () => setCurrent(prev => (prev === 0 ? movies.length - 1 : prev - 1));

  // El timer se reinicia cada vez que cambia 'current' o 'movies'
  useEffect(() => {
    if (movies.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [current, movies.length]); 

  return { movies, current, loading, next, prev };
};