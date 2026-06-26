import { useCallback, useEffect, useState } from 'react';
import { usersService } from '../../services/users.service';

/**
 * Hook para el botón de suscripción a alertas de preventa de una película.
 *
 * Determina si el usuario ya está suscripto (GET /me/movie-subscriptions/:movieId,
 * que devuelve 404 si no existe — se trata como "no suscripto", no como error)
 * y expone toggle() para suscribirse/cancelar con UI optimista.
 *
 * @param {number|string} movieId
 * @param {boolean} enabled - Si es false, no se consulta el backend (ej. usuario no autenticado)
 */
export const useMovieSubscription = (movieId, enabled = true) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(enabled);
  const [toggling, setToggling] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!movieId || !enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await usersService.getMyMovieSubscriptionById(movieId);
      setIsSubscribed(true);
    } catch (err) {
      // 404 significa que no hay suscripción todavía: estado esperado, no un error.
      if (err?.response?.status !== 404) {
        console.error('Error al consultar suscripción de película:', err);
      }
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, [movieId, enabled]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const toggle = useCallback(async () => {
    if (!movieId || toggling) return;

    // UI optimista: refleja el cambio antes de la respuesta del servidor.
    const previousValue = isSubscribed;
    setIsSubscribed(!previousValue);
    setToggling(true);

    try {
      if (previousValue) {
        await usersService.unsubscribeFromMovie(movieId);
      } else {
        await usersService.subscribeToMovie(movieId);
      }
    } catch (err) {
      console.error('Error al cambiar suscripción de película:', err);
      // Revertir si falló la petición.
      setIsSubscribed(previousValue);
      throw err;
    } finally {
      setToggling(false);
    }
  }, [movieId, isSubscribed, toggling]);

  return { isSubscribed, loading, toggling, toggle };
};
