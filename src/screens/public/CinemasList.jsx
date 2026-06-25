import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppText } from '../../components/AppText';
import CinemaGrid from '../../components/cinemas/CinemaGrid';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { theme } from '../../constants';
import { getCinemas } from '../../services/cinemas.service';

export default function CinemasList() {
  const [cinemas, setCinemas] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  const fetchCinemas = useCallback(
    async (pageToLoad) => {
      if (pageToLoad !== 1 && (!hasMore || loadingMore)) return;

      try {
        if (pageToLoad === 1) setInitialLoading(true);
        else setLoadingMore(true);

        const response = await getCinemas({ page: pageToLoad, limit: 10 });

        // Normalizamos la respuesta: manejar si viene array directo o con objeto data/metadata
        const isArrayResponse = Array.isArray(response);
        const newCinemas = isArrayResponse ? response : response?.data || [];
        const metadata = isArrayResponse ? {} : response?.metadata || {};

        // Evaluar si hay más páginas disponibles
        // Usamos != null para capturar tanto null como undefined
        const nextPageAvailable = metadata.next_page != null;

        // Setear el estado acumulando los cines previos si se esta haciendo scroll
        setCinemas((prev) => {
          if (pageToLoad === 1) return newCinemas;

          // Filtro de seguridad: Evitar duplicados por ID (Causa real del error de llaves)
          const existingIds = new Set(prev.map((c) => c.id));
          const uniqueNew = newCinemas.filter((c) => !existingIds.has(c.id));
          return [...prev, ...uniqueNew];
        });

        setHasMore(nextPageAvailable);
        setPage(pageToLoad);
      } catch (err) {
        console.error('Error fetching paginated cinemas:', err);
        setError('No se pudieron cargar las sucursales.');
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
      }
    },
    [hasMore, loadingMore]
  );

  useEffect(() => {
    fetchCinemas(1);
  }, []);

  const handleLoadMore = () => {
    if (!initialLoading && !loadingMore && hasMore) {
      fetchCinemas(page + 1);
    }
  };

  const handleCinemaSelect = (id) => {
    router.push({
      pathname: `/cinemas/${id}`,
    });
  };

  return (
    <ScreenWrapper>
      {initialLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error && cinemas.length === 0 ? (
        <View style={styles.centered}>
          <AppText variant="body" style={styles.errorText}>
            {error}
          </AppText>
        </View>
      ) : (
        <CinemaGrid
          cinemas={cinemas}
          onPress={handleCinemaSelect}
          onLoadMore={handleLoadMore}
          loadingMore={loadingMore}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: theme.colors.error, textAlign: 'center', padding: 20 },
});
