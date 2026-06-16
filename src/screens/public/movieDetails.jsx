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
import AppText from '../../components/AppText';
import ScreenWrapper from '../../components/ScreenWrapper'
import { getMovieById } from '../../services/movies.service';
import { getShowtimesByMovie } from '../../services/showtimes.service';
import { formatHumanDate, generateNextDays } from '../../utils/dateUtils';

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
      .map(st => st.start_time ? st.start_time.substring(0, 10) : null)
      .filter(Boolean)
  );
    // Retornar únicamente los días del calendario que tengan funciones asociadas
    return next7Days.filter(day => activeDatesSet.has(day.fullDate));
  }, [showtimes]);

  useEffect(() => {
    if (availableDatesCarousel.length > 0) {
      const isCurrentDateAvailable = availableDatesCarousel.some(d => d.fullDate === selectedDate);
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

  if (!movie) {
    return (
      <ScreenWrapper style={styles.centered}>
        <AppText variant="subtitle">Película No Encontrada</AppText>
      </ScreenWrapper>
    );
  }

  const showPlaceholder = !movie.banner_url && !movie.poster_url;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.bgDeep, COLORS.bgMagenta, COLORS.bgDeep]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          {showPlaceholder || imageError ? (
            <View style={styles.placeholderHero}>
              <Film size={64} color={COLORS.accent} />
              <Text style={styles.placeholderText}>Cineflix</Text>
            </View>
          ) : (
            <Image
              source={{ uri: movie.banner_url || movie.poster_url }}
              style={styles.bannerImage}
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

        </View>

        {/* CONTENEDOR DE INFORMACION PRINCIPAL */}
        <View style={styles.infoContent}>
          
          {/* FILA DE CABECERA: Solapa el póster completo y agrupa el título a su lado */}
          <View style={styles.headerRow}>
            <View style={styles.posterWrapper}>
              <Image
                source={{ uri: movie.poster_url }}
                style={styles.moviePoster}
                contentFit="cover"
              />
              {movie.trailer_url && (
                <TouchableOpacity
                  style={styles.trailerPlayBadge}
                  onPress={handleWatchTrailer}
                  activeOpacity={0.8}
                >
                  <Play size={14} color="black" fill="black" />
                </TouchableOpacity>
              )}
            </View>

            {/* Título y metadatos rápidos */}
            <View style={styles.titleBlock}>
              <Text style={styles.title} numberOfLines={2}>
                {movie.title}
              </Text>
              {movie.trailer_url && (
                <TouchableOpacity
                  style={styles.trailerTextLink}
                  onPress={handleWatchTrailer}
                >
                  <Play size={12} color={COLORS.accent} fill={COLORS.accent} />
                  <Text style={styles.trailerLinkText}>VER TRÁILER</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
       
        {/* 3. FICHA TÉCNICA Y CONTENIDO */}
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
                  {movie.age_classification?.description || 'Apto todo público'}
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

          {/* Selectores de Horarios */}
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
 // Estructura Banner Panorámico 16:9
  heroContainer: { 
    width: '100%', 
    aspectRatio: 16 / 9,
    position: 'relative'
  },
  bannerImage: { width: '100%', height: '100%' },

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
    top: 45,
    left: 20,
    width: 40,                
    height: 40,
    justifyContent: 'center',   
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    zIndex: 10,
  },

  // Contenedor principal de info con desfase hacia arriba
  infoContent: { 
    paddingHorizontal: 20, 
    marginTop: -75, // subir el bloque completo sobre el banner
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Alistar base del texto con base del póster
    marginBottom: 20,
  },
  posterWrapper: {
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  moviePoster: { 
    width: 110, 
    height: 165, // Proporción 2:3 
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: '#231640',
  },
  trailerPlayBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: COLORS.accent,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBlock: {
    flex: 1, 
    marginLeft: 16,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textMain,
    lineHeight: 28,
  },
  trailerTextLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  trailerLinkText: {
    color: COLORS.accent,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
  },

  // Ficha Técnica
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
  techValue: { color: COLORS.textMain, fontSize: 13, fontWeight: '600' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginTop: 10,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  synopsis: { color: COLORS.textGray, fontSize: 14, lineHeight: 22, marginBottom: 20 },
  errorText: { color: '#FF5252', textAlign: 'center', padding: 20 },
});
