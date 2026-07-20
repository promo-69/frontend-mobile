import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  ActivityIndicator
} from 'react-native';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Sliders, Calendar } from 'lucide-react-native';
import { theme } from '../../../constants';
import MovieCard from '../../../components/movies/MovieCard';
import MyGenresModal from '../../../components/home/MyGenresModal';
import { getMoviesByGenres, getMoviesGenres } from '../../../services/movies.service';

export default function MyGenres() {
  const router = useRouter();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenresModal, setShowGenresModal] = useState(false);

  // Carga de películas filtradas por los géneros guardados del usuario
  const loadMoviesByGenres = async () => {
    try {
      setLoading(true);
      const favoriteGenres = await getMoviesGenres();

      if (favoriteGenres && favoriteGenres.length > 0) {
        const ids = favoriteGenres.map(genre => genre.id);
        const dataPayload = await getMoviesByGenres(ids);
        setMovies(dataPayload || []);
      } else {
        setMovies([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar el listado de películas por género:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMoviesByGenres();
  }, []);

  // Ordenamiento cronológico por fecha de estreno
  const sortedMovies = useMemo(() => {
    return [...movies].sort((a, b) => {
      const dateA = new Date(a.release_date || '9999-12-31');
      const dateB = new Date(b.release_date || '9999-12-31');
      return dateA - dateB;
    });
  }, [movies]);

  // Formateador de fechas localizado para es-VE
  const formatDate = (dateString) => {
    if (!dateString) return 'Por anunciar';
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return 'Por anunciar';

    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-VE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).replace('.', '');
  };


  if (loading) {
    return (
      <ScreenWrapper>
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.textAccent.gold} />
        <Text style={styles.loadingText}>Buscando películas ideales para ti...</Text>
      </View>
      </ScreenWrapper>
    );
  }

  return (
   <ScreenWrapper>
      <View style={styles.mainContainer}>

        {/* CABECERA DE LA PANTALLA
        <View style={styles.headerContainer}>
          <View style={styles.titleBorderGroup}>
            <Text style={styles.headerTitle}>
              Recomendaciones {'\n'}
              <Text style={styles.headerTitleHighlight}>Por Género</Text>
            </Text>
            <Text style={styles.headerSubtitle}>
              Explora el catálogo de películas seleccionadas minuciosamente basándonos en tus preferencias y géneros cinematográficos favoritos.
            </Text>
          </View>

          <Pressable
            onPress={() => setShowGenresModal(true)}
            style={({ pressed }) => [styles.adjustButton, pressed && styles.buttonPressed]}
          >
            <Sliders size={14} color="#231640" strokeWidth={3} />
            <Text style={styles.adjustButtonText}>Ajustar mis géneros</Text>
          </Pressable>
        </View>*/}

        {/* 2. TEXTO INFORMATIVO (SUBHEADER REESTRUCTURADO) */}
        <View style={styles.subHeaderContainer}>
          <Text style={styles.headerSubtitle}>
            Explora el catálogo de películas seleccionadas minuciosamente basándonos en tus preferencias cinematográficas.
          </Text>

          <Pressable
            onPress={() => setShowGenresModal(true)}
            style={({ pressed }) => [styles.adjustButton, pressed && styles.buttonPressed]}
          >
            <Sliders size={14} color="#231640" strokeWidth={2.5} />
            <Text style={styles.adjustButtonText}>Ajustar mis géneros</Text>
          </Pressable>
        </View>

        {/* LISTADO DE PELÍCULAS */}
        <FlatList
          data={sortedMovies}
          keyExtractor={(item, index) => item.id?.toString() || `genre-movie-${index}`}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No se encontraron películas que coincidan con tus géneros configurados actualmente.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            return (
              <View style={styles.cardWrapper}>
                <View style={styles.movieCardWrapper}>
                  <MovieCard
                    title={item.title}
                    posterUrl={item.poster_url}
                    style={styles.fullWidth}
                    onPress={() => router.push(`/content/${item.id}?type=${item.contentType || 'movie'}`)}
                  />
                </View>

                {/* Etiqueta externa de estreno */}
                <View style={styles.dateBadge}>
                  <Calendar size={12} color={theme.colors.textAccent.gold} />
                  <Text style={styles.dateText}>Estreno: {formatDate(item.release_date)}</Text>
                </View>
              </View>
            );
          }}
        />

        {/* MODAL CONFIGURADOR DE PREFERENCIAS */}
        <MyGenresModal
          open={showGenresModal}
          onClose={(updated) => {
            setShowGenresModal(false);
            if (updated) loadMoviesByGenres();
          }}
        />
      </View>
   </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  subHeaderContainer: {
    marginBottom: theme.spacing.s8,
    gap: theme.spacing.s16,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.s16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.s16,
  },
  loadingText: {
    ...theme.typography.variants.caption,
    color: theme.colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: theme.typography.family.primary.bold,
  },
  headerSubtitle: {
    ...theme.typography.variants.smallText,
    color: '#FFFF',
    marginTop: theme.spacing.s8,
    lineHeight: 16,
  },
  adjustButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.textAccent.gold,
    paddingHorizontal: theme.spacing.s16,
    paddingVertical: theme.spacing.s12,
    borderRadius: theme.borderRadius.s12,
    gap: theme.spacing.s8,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  adjustButtonText: {
    ...theme.typography.variants.label,
    color: '#231640',
    fontFamily: theme.typography.family.primary.bold,
    textTransform: 'uppercase',
  },
  listContent: {
    paddingBottom: theme.spacing.s32,
    flexGrow: 1,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing.s24,
  },
  cardWrapper: {
    width: '47%',
    gap: theme.spacing.s8,
  },
  movieCardWrapper: {
    borderRadius: theme.borderRadius.s16,
    overflow: 'hidden',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(217, 152, 47, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(217, 152, 47, 0.2)',
    paddingHorizontal: theme.spacing.s8,
    paddingVertical: theme.spacing.s4,
    borderRadius: 6,
    gap: 4,
  },
  dateText: {
    fontSize: 10,
    color: theme.colors.textAccent.gold,
    fontFamily: theme.typography.family.primary.bold,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.s48,
  },
  emptyText: {
    ...theme.typography.variants.body,
    color: theme.colors.textDisabled,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: theme.spacing.s16,
    borderRadius: theme.borderRadius.s16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
});
