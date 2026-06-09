import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MovieSkeleton from '../../components/showtimes/MovieSkeleton';
import ShowtimesList from '../../components/showtimes/ShowtimesList';
import { getMovieById } from '../../services/movies.service';
import { getShowtimesByMovie } from '../../services/showtimes.service';

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

const formatGenres = (genres) =>
  genres?.map((g) => g.description).join(', ') || 'N/A';

export default function MovieDetails() {
  const { movieId } = useLocalSearchParams();
  const router = useRouter();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [movieData, showtimesData] = await Promise.all([
          getMovieById(movieId),
          getShowtimesByMovie(movieId),
        ]);
        setMovie(movieData);
        setShowtimes(showtimesData || []);
      } catch (error) {
        console.error('Error loading movie details:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [movieId]);

  const handleWatchTrailer = () => {
    if (movie?.trailer_url) {
      Linking.openURL(movie.trailer_url).catch(() =>
        console.error('No se pudo abrir el trailer')
      );
    }
  };

  if (loading) return <MovieSkeleton />;

  if (!movie) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.bgDeep, COLORS.bgMagenta, COLORS.bgDeep]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: movie.poster_url }}
            style={styles.mainPoster}
            contentFit="cover"
            transition={500}
          />
          <LinearGradient
            colors={['transparent', 'rgba(35, 22, 64, 0.5)', COLORS.bgDeep]}
            style={styles.gradient}
          />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" color="white" size={28} />
          </TouchableOpacity>

          {movie.trailer_url && (
            <TouchableOpacity
              style={styles.trailerButton}
              onPress={handleWatchTrailer}
            >
              <Ionicons name="play" size={20} color="black" />
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
                  {movie.age_classification?.description}
                </Text>
              </View>
            </View>
            <View style={[styles.techRow, styles.techBorderTop]}>
              <View style={styles.techItem}>
                <Text style={styles.techLabel}>ESTRENO</Text>
                <Text style={styles.techValue}>{movie.release_date}</Text>
              </View>
              <View style={[styles.techItem, styles.techBorderLeft]}>
                <Text style={styles.techLabel}>ESTADO</Text>
                <Text style={[styles.techValue, { color: COLORS.accent }]}>
                  {movie.lifecycle_state?.description}
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

          <ShowtimesList movieId={movieId} showtimes={showtimes} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDeep },
  heroContainer: { width: '100%', height: width * 1.1 },
  mainPoster: { width: '100%', height: '100%', resizeMode: 'cover' },
  gradient: { ...StyleSheet.absoluteFillObject },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 25,
    padding: 8,
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
  infoContent: { paddingHorizontal: 20, marginTop: -30 },
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
});
