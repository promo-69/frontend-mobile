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
import ContentInfoSheet from '../../components/showtimes/ContentInfoSheet';
import ContentSkeleton from '../../components/showtimes/ContentSkeleton';
import DateCarousel from '../../components/showtimes/DateCarousel';
import ShowtimesList from '../../components/showtimes/ShowtimesList';
import {
  getContentDetails,
  getContentShowtimes,
} from '../../services/showtimes.service';
import { generateNextDays } from '../../utils/dateUtils';

const { width } = Dimensions.get('window');
const COLORS = {
  bgDeep: '#231640',
  bgMagenta: '#7B1A82',
  accent: '#f4b400',
  textMain: '#FFFFFF',
  textGray: '#B0A8C5',
};

export default function ContentDetails() {
  const { movieId, id, type = 'movie' } = useLocalSearchParams();
  // En Expo Router, si el archivo es [movieId].jsx, el valor está en movieId
  const effectiveId = movieId || id;

  const router = useRouter();

  const [contentInfo, setContentInfo] = useState(null);
  const [showtimeData, setShowtimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // 1. Obtener la fecha de hoy local en formato limpio YYYY-MM-DD
  const todayShortString = useMemo(() => {
    const localDate = new Date();
    return localDate.toISOString().split('T')[0];
  }, []);

  const [selectedDate, setSelectedDate] = useState(todayShortString);

  // 2. Generar arreglo estático de 7 días continuos en el frontend
  const localSevenDays = useMemo(() => generateNextDays(), []);

  // 3. Cruzar la data del servidor con los 7 días generados localmente
  const combinedSevenDaysCarousel = useMemo(() => {
    const backendDates = showtimeData?.available_dates || [];
    return localSevenDays.map((day) => ({
      ...day,
      disabled: !backendDates.includes(day.fullDate), // Deshabilitado si el backend no reporta funciones
    }));
  }, [showtimeData?.available_dates, localSevenDays]);

  // Carga unificada de datos con manejo de error simple en el catch
  async function fetchDataAndShowtimes() {
    if (!effectiveId) return;
    try {
      if (!contentInfo) setLoading(true);

      const [infoRes, showtimesRes] = await Promise.all([
        getContentDetails(type, effectiveId),
        getContentShowtimes(type, effectiveId),
      ]);

      setContentInfo(infoRes);
      setShowtimeData(showtimesRes);
    } catch (error) {
      // Catch simple como el original de la versión web
      console.error('Error crítico en detalles de contendio:', error);
      setContentInfo(null);
      setShowtimeData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDataAndShowtimes();
  }, [effectiveId, type]);

  // Si se cambia de contexto y la fecha seleccionada no tiene cartelera, salta al primer día disponible
  useEffect(() => {
    console.log(showtimeData);
    const backendDates = showtimeData?.available_dates || [];
    if (backendDates.length > 0 && !backendDates.includes(selectedDate)) {
      setSelectedDate(backendDates[0]);
    }
  }, [showtimeData, selectedDate]);

  const handleWatchTrailer = () => {
    if (contentInfo?.trailer_url) {
      Linking.openURL(contentInfo.trailer_url).catch((err) =>
        console.error('Error al abrir el trailer:', err)
      );
    }
  };

  if (loading) return <ContentSkeleton />;
  if (!contentInfo) return null; // Retorno seguro si no hay elemento base

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.bgDeep, COLORS.bgMagenta, COLORS.bgDeep]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          {(!contentInfo.banner_url && !contentInfo.poster_url) ||
          imageError ? (
            <View style={styles.placeholderHero}>
              <Film size={64} color={COLORS.accent} />
              <Text style={styles.placeholderText}>Cineflix</Text>
            </View>
          ) : (
            <Image
              source={{ uri: contentInfo.banner_url || contentInfo.poster_url }}
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

        <View style={styles.infoContent}>
          <View style={styles.headerRow}>
            <View style={styles.posterWrapper}>
              <Image
                source={{ uri: contentInfo.poster_url }}
                style={styles.moviePoster}
                contentFit="cover"
              />
              {contentInfo.trailer_url && (
                <TouchableOpacity
                  style={styles.trailerPlayBadge}
                  onPress={handleWatchTrailer}
                  activeOpacity={0.8}
                >
                  <Play size={14} color="black" fill="black" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.titleBlock}>
              <Text style={styles.title} numberOfLines={2}>
                {contentInfo.title}
              </Text>
              {contentInfo.trailer_url && (
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

          <ContentInfoSheet contentInfo={contentInfo} type={type} />

          <Text style={styles.sectionTitle}>Sinopsis</Text>
          <Text style={styles.synopsis}>
            {contentInfo.synopsis ||
              'No hay descripción disponible para este contenido.'}
          </Text>

          {/* Selector de 7 días fijos */}
          <DateCarousel
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            weekdays={combinedSevenDaysCarousel}
          />

          {/* Listado de complejos de cine */}
          <ShowtimesList
            cinemasData={showtimeData?.cinemas || []}
            contentId={effectiveId}
            type={type}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDeep },
  infoContent: { paddingHorizontal: 20, marginTop: -75 },
  heroContainer: { width: '100%', aspectRatio: 16 / 9, position: 'relative' },
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 20 },
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
    height: 165,
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
  titleBlock: { flex: 1, marginLeft: 16, marginBottom: 4 },
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginTop: 10,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  synopsis: {
    color: COLORS.textGray,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
});
