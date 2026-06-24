import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MovieGridCard from '../../components/movies/MovieGridCard'; 
import { getUpcomingMovies } from '../../services/movies.service';
import { useRouter } from 'expo-router';
import { theme } from '../../constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function MoviesUpcoming() {
  const router = useRouter();
  const [billboardMovies, setBillboardMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await getUpcomingMovies();
        setBillboardMovies(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Error cargando los próximos estrenos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const groupedMovies = useMemo(() => {
    if (!Array.isArray(billboardMovies) || billboardMovies.length === 0) return {};

    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    return billboardMovies.reduce((groups, movie) => {
      if (!movie.release_date) {
        const unknownKey = 'Por Confirmar';
        if (!groups[unknownKey]) groups[unknownKey] = [];
        groups[unknownKey].push(movie);
        return groups;
      }

      const parts = movie.release_date.split('-');
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1; 

      if (monthIndex >= 0 && monthIndex < 12) {
        const formattedMonth = `${months[monthIndex]} ${year}`;
        if (!groups[formattedMonth]) groups[formattedMonth] = [];
        groups[formattedMonth].push(movie);
      } else {
        const unknownKey = 'Por Confirmar';
        if (!groups[unknownKey]) groups[unknownKey] = [];
        groups[unknownKey].push(movie);
      }
      return groups;
    }, {});
  }, [billboardMovies]);

  const monthsOrder = useMemo(() => {
    const monthsDirectory = {
      "Enero": 0, "Febrero": 1, "Marzo": 2, "Abril": 3, "Mayo": 4, "Junio": 5,
      "Julio": 6, "Agosto": 7, "Septiembre": 8, "Octubre": 9, "Noviembre": 10, "Diciembre": 11
    };

    return Object.keys(groupedMovies).sort((a, b) => {
      if (a === 'Por Confirmar') return 1;
      if (b === 'Por Confirmar') return -1;

      const partsA = a.split(' ');
      const partsB = b.split(' ');

      const monthA = monthsDirectory[partsA[0]];
      const yearA = parseInt(partsA[1], 10);
      const monthB = monthsDirectory[partsB[0]];
      const yearB = parseInt(partsB[1], 10);

      return new Date(yearA, monthA, 1) - new Date(yearB, monthB, 1);
    });
  }, [groupedMovies]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Cargando próximos estrenos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Próximos <Text style={styles.headerTitleAccent}>Estrenos</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Explora los títulos más esperados que llegarán muy pronto a las salas de Cineflix. ¡Prepara tu agenda cinéfila!
          </Text>
        </View>

        {monthsOrder.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No hay próximos estrenos programados en este momento.
            </Text>
          </View>
        ) : (
          monthsOrder.map((month) => (
            <View key={month} style={styles.sectionContainer}>
              
              {/* Línea divisoria de mes */}
              <View style={styles.monthRow}>
                <Text style={styles.monthTitle}>{month}</Text>
                <View style={styles.monthLine} />
              </View>

              {/* Grid de tarjetas */}
              <View style={styles.grid}>
                {groupedMovies[month].map((movie, index) => {
                  const isSpecialEvent = movie.type === 'special_event' || !!movie.event;
                  return (
                    <View key={`upcoming-${movie.id || index}`} style={styles.cardWrapper}>
                      <MovieGridCard 
                       onPress={() => {
                        router.push({
                          pathname: `/content/${movie.id}`, 
                          params: { 
                            movieId: movie.id, 
                            type: movie.isEvent ? 'special_event' : 'movie' 
                          }
                        });
                      }}
                      />
                    </View>
                  );
                })}
              </View>

            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#231640',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#231640',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#D1D5DB',
    fontSize: 14,
    marginTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    borderLeftWidth: 4,
    borderLeftColor: '#F6AD38',
    paddingLeft: 12,
    marginBottom: 32,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  headerTitleAccent: {
    color: '#F6AD38',
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  emptyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 32,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    color: '#F6AD38',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginRight: 12,
  },
  monthLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginHorizontal: 8,
    marginBottom: 16,
  },
});