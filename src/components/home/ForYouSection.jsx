import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, ChevronRight, Film } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { theme } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useBottomSheet } from '../../context/BottomSheetContext';
import {
    getMoviesByGenres,
    getMoviesGenres,
} from '../../services/movies.service';
import MovieCard from '../movies/MovieCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - theme.spacing.s16 * 2; // Ancho responsivo restando paddings laterales

const GENRES_IMG = require('../../assets/images/genres.webp');
const ROOM_RENT_IMG = require('../../assets/images/room-rent.webp');

export default function ForYouSection() {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();
  const { showBottomSheet } = useBottomSheet();

  const [genres, setGenres] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Referencias nativas para los carruseles (Evita interactuar con el DOM de forma web)
  const bannerRef = useRef(null);
  const moviesListRef = useRef(null);
  const currentMovieIndexRef = useRef(0);

  // 1. Fetch de datos según autenticación
  useEffect(() => {
    const fetchPersonalizedData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const userGenres = await getMoviesGenres();
        if (userGenres && userGenres.length > 0) {
          setGenres(userGenres);
          const genreIds = userGenres.map((g) => g.id);
          const moviesData = await getMoviesByGenres(genreIds);
          setRecommendedMovies(moviesData || []);
        } else {
          setGenres([]);
        }
      } catch (error) {
        console.error('[ForYouSection] Error en datos móviles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalizedData();
  }, [isAuthenticated]);

  // 2. Timer nativo para el auto-scroll del banner publicitario
  useEffect(() => {
    if (!loading && (genres.length === 0 || !isAuthenticated)) {
      const interval = setInterval(() => {
        const nextIndex = currentBannerIndex === 0 ? 1 : 0;
        setCurrentBannerIndex(nextIndex);
        bannerRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [loading, genres, isAuthenticated, currentBannerIndex]);

  // Manejo de clicks en banners publicitarios
  const handleBannerPress = (type) => {
    if (!isAuthenticated) {
      showBottomSheet({
        title: type === 'genres' ? '¿Iniciar Sesión?' : '¿Reservar Sala?',
        message:
          type === 'genres'
            ? 'Para poder seleccionar tus géneros cinematográficos preferidos y armar una cartelera personalizada, necesitas acceder a tu cuenta.'
            : 'Para consultar la disponibilidad, tarifas y realizar el alquiler de nuestras salas privadas de cine, debes iniciar sesión primero.',
        primaryButton: {
          text: 'Iniciar Sesión',
          onPress: () => navigation.navigate('Login'),
        },
        secondaryButton: {
          text: 'Volver',
          onPress: () => {},
        },
      });
    } else {
      navigation.navigate(type === 'genres' ? 'MyGenres' : 'RoomRent');
    }
  };

  // Desplazamiento manual del carrusel de películas (Por índice, sin romper layouts)
  const handleMoviesScroll = (direction) => {
    if (recommendedMovies.length === 0) return;

    let nextIndex =
      direction === 'left'
        ? currentMovieIndexRef.current - 1
        : currentMovieIndexRef.current + 1;

    if (nextIndex >= 0 && nextIndex < recommendedMovies.length) {
      currentMovieIndexRef.current = nextIndex;
      moviesListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // --- DATA DEL BANNER PUBLICITARIO ---
  const bannerData = [
    {
      id: 'genres',
      image: GENRES_IMG,
      tag: 'Recomendaciones personalizadas',
      title: '¿No sabes qué ver? Elige tus géneros',
      desc: !isAuthenticated
        ? 'Inicia sesión para armar tu cartelera perfecta.'
        : 'Personaliza tu sección "Para Ti" en segundos.',
      tagColor: theme.colors.accent,
    },
    {
      id: 'rooms',
      image: ROOM_RENT_IMG,
      tag: 'Experiencias exclusivas',
      title: 'Alquila tu propia sala de cine',
      desc: 'Disfruta de funciones privadas con tus amigos con la mejor comodidad tecnológica.',
      tagColor: theme.colors.info,
    },
  ];

  // ================= SCENARIO A: MODAL INVITADO O SIN PREFERENCIAS =================
  if (!isAuthenticated || genres.length === 0) {
    return (
      <View style={styles.container}>
        <FlatList
          ref={bannerRef}
          data={bannerData}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / BANNER_WIDTH
            );
            setCurrentBannerIndex(index);
          }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleBannerPress(item.id)}
              style={styles.bannerWrapper}
            >
              <ImageBackground
                source={item.image}
                style={styles.bannerBackground}
                imageStyle={{ borderRadius: theme.borderRadius.s16 }}
              >
                {/* Degradado simulado nativo oscuro */}
                <View style={styles.bannerOverlay}>
                  <Text style={[styles.bannerTag, { color: item.tagColor }]}>
                    {item.tag}
                  </Text>
                  <Text style={styles.bannerTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.bannerDesc} numberOfLines={2}>
                    {item.desc}
                  </Text>
                </View>
              </ImageBackground>
            </Pressable>
          )}
        />

        {/* Indicadores de paginación inferiores (Dots) */}
        <View style={styles.dotsContainer}>
          {bannerData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentBannerIndex === index
                  ? styles.dotActive
                  : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      </View>
    );
  }

  // ================= SCENARIO B: FEED PREMIUM "PARA TI" =================
  return (
    <View style={styles.container}>
      {/* Encabezado Mobile Estructurado */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTextGroup}>
          <View style={styles.titleRow}>
            <Film size={22} color={theme.colors.accent} />
            <Text style={styles.sectionTitle}>Para ti</Text>
          </View>
          <Text style={styles.sectionSubtitle} numberOfLines={1}>
            Basado en tus géneros:{' '}
            {genres.map((g) => g.description || g.name).join(', ')}
          </Text>
        </View>

        {/* Controles de navegación táctiles laterales */}
        <View style={styles.controlsRow}>
          <Pressable
            onPress={() => handleMoviesScroll('left')}
            style={styles.arrowButton}
          >
            <ChevronLeft size={20} color={theme.colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => handleMoviesScroll('right')}
            style={styles.arrowButton}
          >
            <ChevronRight size={20} color={theme.colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('MyGenres')}
            style={styles.seeMoreButton}
          >
            <Text style={styles.seeMoreText}>Ver más</Text>
          </Pressable>
        </View>
      </View>

      {/* Lista Horizontal de Recomendaciones */}
      {recommendedMovies.length === 0 ? (
        <Text style={styles.emptyText}>
          No hay películas disponibles en este momento.
        </Text>
      ) : (
        <FlatList
          ref={moviesListRef}
          data={recommendedMovies}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => `foru-movie-${item.id}-${index}`}
          contentContainerStyle={styles.moviesListContent}
          getItemLayout={(data, index) => ({
            length: 150, // Ancho estimado del MovieCard + margin
            offset: 150 * index,
            index,
          })}
          renderItem={({ item }) => (
            <View style={styles.movieCardContainer}>
              <MovieCard movie={item} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    marginVertical: theme.spacing.s16,
  },
  // --- Estilos de Banners Publicitarios ---
  bannerWrapper: {
    width: BANNER_WIDTH,
    marginRight: theme.spacing.s16, // Simula el espaciado entre páginas
  },
  bannerBackground: {
    height: 180,
    width: '100%',
    justifyContent: 'flex-end',
  },
  bannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(19, 11, 36, 0.65)', // Multi-blend simulado nativamente con overlay
    padding: theme.spacing.s16,
    justifyContent: 'center',
    borderRadius: theme.borderRadius.s16,
  },
  bannerTag: {
    ...theme.typography.variants.caption,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.s4,
  },
  bannerTitle: {
    ...theme.typography.variants.subtitle,
    color: '#FFFFFF',
    fontFamily: theme.typography.family.primary.bold,
    textTransform: 'uppercase',
  },
  bannerDesc: {
    ...theme.typography.variants.smallText,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.s4,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.s12,
  },
  dot: {
    height: 6,
    borderRadius: theme.borderRadius.sFull,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 20,
    backgroundColor: theme.colors.accent,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  // --- Estilos del Feed Premium ---
  headerContainer: {
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: theme.spacing.s12,
    marginBottom: theme.spacing.s16,
  },
  headerTextGroup: {
    marginBottom: theme.spacing.s12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s8,
  },
  sectionTitle: {
    ...theme.typography.variants.subtitle,
    color: theme.colors.accent,
    fontFamily: theme.typography.family.primary.bold,
    textTransform: 'uppercase',
  },
  sectionSubtitle: {
    ...theme.typography.variants.caption,
    color: theme.colors.textDisabled,
    fontFamily: theme.typography.family.primary.medium,
    marginTop: theme.spacing.s4,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing.s8,
  },
  arrowButton: {
    padding: theme.spacing.s8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.s8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  seeMoreButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.s16,
    paddingVertical: theme.spacing.s8,
    borderRadius: theme.borderRadius.s8,
    marginLeft: theme.spacing.s4,
  },
  seeMoreText: {
    ...theme.typography.variants.label,
    color: theme.colors.textBlack,
    textTransform: 'uppercase',
  },
  moviesListContent: {
    gap: theme.spacing.s12,
  },
  movieCardContainer: {
    width: 138, // Ajuste responsivo de ancho de cartelera en Mobile
  },
  emptyText: {
    ...theme.typography.variants.body,
    color: theme.colors.textDisabled,
    fontStyle: 'italic',
    paddingVertical: theme.spacing.s16,
  },
});
