import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { AppText } from '../../components/AppText';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { theme } from '../../constants';
import { generateNextDays } from '../../utils/dateUtils';
import { getCinemaById, getCinemaBillboard } from '../../services/cinemas.service';


export default function CinemaDetails() {
 const { cinemaId } = useLocalSearchParams();
  const router = useRouter();

  const [cinema, setCinema] = useState(null);
  const [billboardData, setBillboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  const dateTabs = useMemo(() => generateNextDays(7), []);
  const [selectedDate, setSelectedDate] = useState(dateTabs[0]?.fullDate || '');

  useEffect(() => {
    async function fetchCinemaAndBillboard() {
      try {
        setLoading(true);
        if (!cinemaId) return;

        // 1. Obtener el cine directamente por ID (más eficiente)
        const matchedCinema = await getCinemaById(cinemaId);

        if (matchedCinema) {
          setCinema(matchedCinema);
          
          // 2. Intentar obtener la cartelera de forma independiente
          try {
            const billboard = await getCinemaBillboard(matchedCinema.id);
            setBillboardData(billboard);
          } catch (billboardError) {
            console.warn('La cartelera no se pudo cargar (404), pero la sucursal existe:', billboardError.config?.url);
            setBillboardData([]);
          }
        }
      }
      catch (error) {
        console.error('Error crítico al cargar detalles del cine:', error);
        setCinema(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCinemaAndBillboard();
  }, [cinemaId]);

  //Filtrado reactivo por Fecha y normalización de la estructura (movie / event)
  const filteredBillboard = useMemo(() => {
    if (!billboardData) return [];

    return billboardData
      .map((item) => {
        const content =  item.movie || item.event;

        if (!content) return null;

        const matchingShowtimes = item.showtimes ? item.showtimes.filter((st) => {
          if (!st.booking?.start_time) return false;
          return st.booking.start_time.split('T')[0] === selectedDate;
        }) : [];

        return {
          id: content.id,
          type: item.movie ? 'movie' : 'special_event',
          title: content.title,
          duration: content.duration_minutes,
          posterUrl: content.poster_url,
          lifecycle: content.lifecycle?.description,
          ageClassification: content.age_classification?.description,
          showtimes: matchingShowtimes,
        };
      })
      .filter((item) => item !== null)

      .filter((item) => item.showtimes.length > 0); 
  }, [billboardData, selectedDate]);


  if (loading) {
    return (
      <ScreenWrapper style={styles.centered}>
        <ActivityIndicator
          size="large"
          color={theme.colors.accent || '#F6AD38'}
        />
        <AppText variant="body" style={styles.loadingText}>
          Cargando detalles de la sucursal...
        </AppText>
      </ScreenWrapper>
    );
  }

  if (!cinema) {
    return (
      <ScreenWrapper style={styles.centered}>
        <AppText variant="subtitle">Sucursal No Encontrada</AppText>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll>
      
        {/* HEADER BANNER PANORÁMICO */}
      <View style={styles.bannerContainer}>
        <Image
          source={{
            uri: cinema.image_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000',
          }}
          style={styles.cinemaImage}
          contentFit="cover"
          transition={400}
        />
        <LinearGradient colors={['transparent', '#180F2A']} style={styles.gradientOverlay} />
        <View style={styles.titleOverlay}>
          <AppText style={styles.upperLabel}>CARTELERA EN</AppText>
          <AppText variant="h1" style={styles.title}>{cinema.name}</AppText>
        </View>
      </View>

      {/** SELECTOR DE FECHAS */}
      <View style={styles.carouselContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
          {dateTabs.map((day) => {
            const isSelected = day.fullDate === selectedDate;
            return (
              <TouchableOpacity
                key={day.id}
                onPress={() => setSelectedDate(day.fullDate)}
                style={[styles.dateCard, isSelected && styles.dateCardActive]}
              >
                <AppText style={[styles.dateDay, isSelected && styles.textActive]}>{day.day}</AppText>
                <AppText style={[styles.dateNumber, isSelected && styles.textActive]}>{day.date}</AppText>
                <AppText style={[styles.dateMonth, isSelected && styles.textActive]}>{day.month}</AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* LISTA DE FUNCIONES */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredBillboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>
              No hay funciones programadas para esta fecha.
            </AppText>
          </View>
        ) : (
          filteredBillboard.map((item) => (
            <View key={`${item.type}-${item.id}`} style={styles.movieCard}>
              <Image
                source={{ uri: item.posterUrl || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500' }}
                style={styles.moviePoster}
                contentFit="cover"
              />
              
              <View style={styles.movieInfo}>
                <View>
                  <View style={styles.badgeRow}>
                    <AppText style={styles.lifecycleBadge}>{item.lifecycle}</AppText>
                    {item.type === 'special_event' && (
                      <AppText style={styles.eventBadge}>Evento Especial</AppText>
                    )}
                  </View>
                  <AppText variant="subtitle" style={styles.movieTitle} numberOfLines={2}>
                    {item.title}
                  </AppText>
                  <AppText style={styles.movieMeta}>
                    {item.duration} min | {item.ageClassification}
                  </AppText>
                </View>

                <View style={styles.showtimesContainer}>
                  {item.showtimes.map((st) => (
                    <TouchableOpacity 
                      key={st.id} 
                      style={styles.timeBadge}
                      onPress={() => router.push({
                        pathname: '/buy/selectSeats',
                        params: { 
                          showtimeId: st.id,
                          movieId: item.id 
                        }
                      })}
                    >
                      <AppText style={styles.timeText}>
                        {new Date(st.booking.start_time).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </AppText>
                      <AppText style={styles.formatText}>
                        {st.projection_type?.description.replace(' Digital', '')} ({st.language?.description.substring(0, 3)})
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // ==========================================
  // ESTADOS GLOBALES Y UTILERÍAS
  // ==========================================
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    opacity: 0.7,
    color: '#FFFFFF',
  },

  // ==========================================
  // HEADER BANNER (Efecto Cine / Panorámico)
  // ==========================================
  bannerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  cinemaImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
  },
  upperLabel: {
    color: '#F6AD38',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontStyle: 'italic',
  },

  // ==========================================
  // CARRUSEL DE FECHAS (Calendario Horizontal)
  // ==========================================
  carouselContainer: {
    marginVertical: 12,
  },
  dateScroll: {
    paddingHorizontal: 20,
  },
  dateCard: {
    width: 60,
    height: 74,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dateCardActive: {
    backgroundColor: '#231640',
    borderColor: '#F6AD38',
  },
  dateDay: {
    fontSize: 10,
    color: '#B0A8C5',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 1,
  },
  dateMonth: {
    fontSize: 9,
    color: '#B0A8C5',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  textActive: {
    color: '#F6AD38',
  },

  // ==========================================
  // CONTENEDOR PRINCIPAL Y TARJETAS 
  // ==========================================
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  movieCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(35, 22, 64, 0.4)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  moviePoster: {
    width: 90,
    height: 135,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  movieInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  movieMeta: {
    fontSize: 12,
    color: '#B0A8C5',
    marginTop: 2,
  },

  // ==========================================
  // 5. BADGES / ETIQUETAS (Ciclos de vida y Eventos)
  // ==========================================
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  lifecycleBadge: {
    fontSize: 10,
    color: '#F6AD38',
    fontWeight: '600',
    backgroundColor: 'rgba(246, 173, 56, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden', // Requerido en iOS para respetar el borderRadius en componentes de texto
  },
  eventBadge: {
    fontSize: 10,
    color: '#00E5FF',
    fontWeight: '600',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },

  // ==========================================
  // 6. BOTONES DE HORARIOS (Showtimes Grid)
  // ==========================================
  showtimesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  timeBadge: {
    minWidth: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  formatText: {
    color: '#B0A8C5',
    fontSize: 8,
    marginTop: 1,
    fontWeight: '600',
  },

  // ==========================================
  // 7.  ESTADO VACÍO 
  // ==========================================
  emptyContainer: {
    padding: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: '#B0A8C5',
    textAlign: 'center',
    fontSize: 14,
  },
});
