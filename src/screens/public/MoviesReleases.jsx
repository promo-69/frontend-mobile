import { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MovieGridCard from '../../components/movies/MovieGridCard';
import { getMoviesBillboard } from '../../services/movies.service';
import { getProjectionTypes } from '../../services/info.service';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '../../constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function MoviesReleases() {
  const router = useRouter();
  const [billboardMovies, setBillboardMovies] = useState([]);
  const [projectionTypes, setProjectionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProjection, setActiveProjection] = useState('Todos');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [billboardRes, projectionRes] = await Promise.all([
          getMoviesBillboard(),
          getProjectionTypes()
        ]);

        const rawProjections = projectionRes?.data || projectionRes || [];
        setProjectionTypes(Array.isArray(rawProjections) ? rawProjections : []);

        const billboardData = billboardRes?.data || billboardRes || [];
        const processedItems = billboardData.map(item => {
          const content = item.movie || item.event || item;
          const isSpecialEvent = item.type === 'special_event' || !!item.event;

          const availableFormats = item.showtimes && Array.isArray(item.showtimes)
            ? Array.from(new Set(item.showtimes.map(s => s.projection_type?.description?.trim()).filter(Boolean)))
            : [];

          return {
            ...content,
            title: content.title || content.name,
            type: item.type,
            id: content.id || item.id,
            availableFormats,
            isEvent: isSpecialEvent
          };
        });

        const uniqueItems = Array.from(
          new Map(processedItems.map(item => [`${item.type}-${item.id}`, item])).values()
        );

        setBillboardMovies(uniqueItems);
      } catch (error) {
        console.error("Error inicializando los datos de cartelera:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const filteredMovies = useMemo(() => {
    return billboardMovies.filter(item => {
      if (activeProjection === 'Todos') return true;
      return item.availableFormats?.some(
        format => format.toLowerCase() === activeProjection.toLowerCase()
      );
    });
  }, [billboardMovies, activeProjection]);

  const flatData = useMemo(() => {
    const result = [];
    for (let i = 0; i < filteredMovies.length; i += 2) {
      result.push({
        items: filteredMovies.slice(i, i + 2),
        _key: `row-${i}`,
      });
    }
    return result;
  }, [filteredMovies]);

  const renderFlatItem = useCallback(({ item }) => (
    <View style={styles.cardRow}>
      {item.items.map((movie, index) => (
        <View key={`${movie.type}-${movie.id || index}`} style={styles.cardWrapper}>
          <MovieGridCard
            movie={movie}
            isEventsPage={movie.isEvent}
            onPress={() => {
              router.push({
                pathname: `/content/${movie.id}`,
                params: {
                  movieId: movie.id,
                  type: movie.isEvent ? 'special_event' : 'movie',
                },
              });
            }}
          />
        </View>
      ))}
    </View>
  ), [router]);

  const renderHeader = () => (
    <>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft color="white" size={22} strokeWidth={1} />
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Películas en <Text style={styles.headerTitleAccent}>Cartelera</Text>
        </Text>
        <Text style={styles.headerSubtitle}>
          Filtra por formato de pantalla de tu preferencia para personalizar la experiencia perfecta en nuestras salas.
        </Text>
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            onPress={() => setActiveProjection('Todos')}
            style={[styles.filterButton, activeProjection === 'Todos' && styles.filterButtonActive]}
          >
            <Text style={[styles.filterButtonText, activeProjection === 'Todos' && styles.filterButtonTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>
          {projectionTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              onPress={() => setActiveProjection(type.description)}
              style={[
                styles.filterButton,
                activeProjection.toLowerCase() === type.description?.toLowerCase() && styles.filterButtonActive
              ]}
            >
              <Text style={[
                styles.filterButtonText,
                activeProjection.toLowerCase() === type.description?.toLowerCase() && styles.filterButtonTextActive
              ]}>
                {type.description}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No hay funciones disponibles que coincidan con el formato seleccionado.
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Cargando funciones...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={flatData}
        renderItem={renderFlatItem}
        keyExtractor={(item) => item._key}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
      />
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 999,
    marginBottom: 16,
  },
  header: {
    borderLeftWidth: 4,
    borderLeftColor: '#F6AD38',
    paddingLeft: 12,
    marginBottom: 20,
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
  filterWrapper: {
    marginBottom: 24,
    marginHorizontal: -16,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterButtonActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#A855F7',
  },
  filterButtonText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginHorizontal: 8,
  },
});
