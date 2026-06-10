import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import CinemaGrid from '../../components/cinemas/CinemaGrid';
import { AppText } from '../../components/AppText';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { theme } from '../../constants';
import { getCinemas } from '../../services/cinemas.service';

export default function CinemasList() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCinemas() {
      try {
        setLoading(true);
        const data = await getCinemas();
        setCinemas(data);
      } catch (err) {
        console.error('Error fetching cinemas:', err);
        setError(
          'No se pudieron cargar los cines. Intenta de nuevo más tarde.'
        );
      } finally {
        setLoading(false);
      }
    }
    fetchCinemas();
  }, []);

  return (
    <ScreenWrapper>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <AppText variant="body" style={styles.errorText}>
            {error}
          </AppText>
        </View>
      ) : (
        <CinemaGrid cinemas={cinemas} />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: theme.colors.error, textAlign: 'center', padding: 20 },
});
