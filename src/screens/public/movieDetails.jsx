import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Film, Play } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateSelector from '../../components/showtimes/DateSelector';
import ShowtimesList from '../../components/showtimes/ShowtimesList';
import MovieSkeleton from '../../components/showtimes/MovieSkeleton';
import { MovieSubscribeButton } from '../../components/movies/MovieSubscribeButton';
import { getMovieById } from '../../services/movies.service';
import { getShowtimesByMovie } from '../../services/showtimes.service';
import { formatHumanDate, generateNextDays } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const COLORS = {
  bgDeep: '#231640',
  bgMagenta: '#7B1A82',
  accent: '#f4b400',
  textMain: '#FFFFFF',
  textGray: '#B0A8C5',
  techSheetBg: 'rgba(35, 22, 64, 0.7)',
  border: 'rgba(255, 255, 255, 0.1)',
};

const formatGenres = (genres) => {
  if (!Array.isArray(genres) || genres.length === 0) return 'Desconocido';
  const cleanGenres = genres
    .map((g) => g?._Genres?.description)
    .filter(Boolean);
  return cleanGenres.length > 0 ? cleanGenres.join(', ') : 'Desconocido';
};

export default function MovieDetails() {
  const { movieId } = useLocalSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [imageError, setImageError] = useState(false);

  const todayShortString = useMemo(() => {
    const localDate = new Date();
    const year = localDate.getFullYear();
    const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
    const day = localDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState(todayShortString);

  useEffect(() => {
    async function loadData() {
      // Cláusula que evita peticiones si movieId aún no está definido por el router
      if (!movieId) return;

      try {
        const [movieData, showtimesData] = await Promise.all([
          getMovieById(movieId),
          getShowtimesByMovie(movieId),
        ]);

        // Los servicios ya retornan response.data.data, por lo que usamos la data directa
        setMovie(movieData);
        setShowtimes(Array.isArray(showtimesData) ? showtimesData : []);
      } catch (error) {
        console.error('Error loading movie details:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [movieId]);

  //Filtrar carrusel para mostrar solo los días con funciones
  const availableDatesCarousel = useMemo(() => {
    const next7Days = generateNextDays(7);
    if (showtimes.length === 0) return [];

    // Crear un Set con los strings "YYYY-MM-DD" de las funciones que vienen del backend
    const activeDatesSet = new Set(
      showtimes
        .map((st) => (st.start_time ? st.start_time.substring(0, 10) : null))
        .filter(Boolean)
    );
    // Retornar únicamente los días del calendario que tengan funciones asociadas
    return next7Days.filter((day) => activeDatesSet.has(day.fullDate));
  }, [showtimes]);

  useEffect(() => {
    if (availableDatesCarousel.length > 0) {
      const isCurrentDateAvailable = availableDatesCarousel.some(
        (d) => d.fullDate === selectedDate
      );
      if (!isCurrentDateAvailable) {
        setSelectedDate(availableDatesCarousel[0].fullDate);
      }
    }
  }, [availableDatesCarousel, selectedDate]);

  const handleWatchTrailer = () => {
    if (movie?.trailer_url) {
      Linking.openURL(movie.trailer_url).catch(() =>
        console.error('No se pudo abrir el trailer')
      );
    }
  };

  if (loading) return <MovieSkeleton />;

  if (!movie) return null;

  const showPlaceholder = !movie.poster_url || imageError;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.bgDeep, COLORS.bgMagenta, COLORS.bgDeep]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          {showPlaceholder ? (
            <View style={styles.placeholderHero}>
              <Film size={64} color={COLORS.accent} />
              <Text style={styles.placeholderText}>Cineflix</Text>
            </View>
          ) : (
            <Image
              source={{ uri: movie.poster_url }}
              style={styles.mainPoster}
              contentFit="cover"
              transition={500}
              onError={() => setImageError(true)}
            />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(35, 22, 64, 0.5)', COLORS.bgDeep]}
            style={styles.gradient}
          />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft color="white" size={28} />
          </TouchableOpacity>

          {movie.trailer_url && (
            <TouchableOpacity
              style={styles.trailerButton}
              onPress={handleWatchTrailer}
            >
              <Play size={20} color="black" />
              <Text style={styles.trailerText}>VER TRAILER</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.title}>{movie.title}</Text>

          <View style={styles.techSheet}>
            <View style={styles.techRow}>
              <View style={styles.techItem}>
                <Text style={styles.techLabel}>DURACIÓN</Text>
                <Text style={styles.techValue}>
                  {movie.duration_minutes} min
                </Text>
              </View>
              <View style={[styles.techItem, styles.techBorderLeft]}>
                <Text style={styles.techLabel}>CLASIFICACIÓN</Text>
                <Text style={styles.techValue}>
                  {movie.age_classification?.description ||
                    'Apto para todo público'}
                </Text>
              </View>
            </View>
            <View style={[styles.techRow, styles.techBorderTop]}>
              <View style={styles.techItem}>
                <Text style={styles.techLabel}>ESTRENO</Text>
                <Text style={styles.techValue}>
                  {formatHumanDate(movie.release_date) || 'No definida'}
                </Text>
              </View>
              <View style={[styles.techItem, styles.techBorderLeft]}>
                <Text style={styles.techLabel}>ESTADO</Text>
                <Text style={[styles.techValue, { color: COLORS.accent }]}>
                  {movie.lifecycle_state?.description || 'Desconocido'}
                </Text>
              </View>
            </View>
            <View style={[styles.techRow, styles.techBorderTop]}>
              <View style={styles.techItemFull}>
                <Text style={styles.techLabel}>GÉNEROS</Text>
                <Text style={styles.techValue}>
                  {formatGenres(movie.genres)}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Sinopsis</Text>
          <Text style={styles.synopsis}>{movie.synopsis}</Text>

          {movie.lifecycle_state?.description === 'Próximamente' &&
            isAuthenticated && (
              <View style={styles.subscribeWrapper}>
                <MovieSubscribeButton movieId={movieId} />
              </View>
            )}

          <DateSelector
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            weekdays={availableDatesCarousel}
          />

          <ShowtimesList
            showtimes={showtimes}
            movieId={movieId}
            selectedDate={selectedDate}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDeep },
  heroContainer: {
    width: '100%',
    height: width * 1.35,
  },
  mainPoster: { width: '100%', height: '100%', resizeMode: 'cover' },

  placeholderHero: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E1E4E',
  },
  placeholderText: {
    color: COLORS.textGray,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  gradient: { ...StyleSheet.absoluteFillObject },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    marginRight: 2,
    justifyContent: 'center', // Centrado vertical de los hijos (icono)
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 25,
    zIndex: 10,
  },
  trailerButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 30,
    elevation: 5,
  },
  trailerText: {
    color: 'black',
    fontWeight: '900',
    fontSize: 13,
    marginLeft: 8,
  },
  infoContent: {
    paddingHorizontal: 20,
    marginTop: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 20,
  },
  techSheet: {
    backgroundColor: COLORS.techSheetBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 25,
    overflow: 'hidden',
  },
  techRow: { flexDirection: 'row' },
  techItem: { flex: 1, padding: 15 },
  techItemFull: { flex: 1, padding: 15 },
  techBorderLeft: { borderLeftWidth: 1, borderLeftColor: COLORS.border },
  techBorderTop: { borderTopWidth: 1, borderTopColor: COLORS.border },
  techLabel: {
    color: COLORS.textGray,
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  techValue: { color: COLORS.textMain, fontSize: 14, fontWeight: '600' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginTop: 25,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  synopsis: { color: COLORS.textGray, fontSize: 15, lineHeight: 22 },
  subscribeWrapper: { marginTop: 16 },
});
