import { useRouter } from 'expo-router';
import { AlertTriangle, Film } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { useMovieCarousel } from '../../hooks/movies/useMovieCarousel';
import MovieCard from '../movies/MovieCard';
import Banner from './Banner';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.52;

export default function MainCarousel() {
  const { movies, loading, error, refetch } = useMovieCarousel();
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  // Cargando contenido (Skeleton Placeholder básico)
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FFC864" />
        <Text style={styles.infoText}>Preparando cartelera...</Text>
      </View>
    );
  }

  // Error de Red o Servidor caído
  if (error) {
    return (
      <View style={[styles.container, styles.center, styles.errorBorder]}>
        <AlertTriangle size={40} color="#FF6464" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty State
  if (movies.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Film size={40} color="#B0A8C5" />
        <Text style={styles.infoText}>
          No hay funciones programadas para hoy.
        </Text>
      </View>
    );
  }

  const activeMovie = movies[activeIndex];

  return (
    <View style={styles.container}>
      <Banner bannerUrl={activeMovie?.bannerUrl || activeMovie?.banner_url} />

      <View style={styles.carouselWrapper}>
        <Carousel
          loop
          width={width}
          height={370}
          style={styles.carousel}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.9,
            parallaxScrollingOffset: 50,
          }}
          autoPlay={true}
          autoPlayInterval={5000}
          scrollAnimationDuration={800}
          data={movies}
          onSnapToItem={(index) => setActiveIndex(index)}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <MovieCard
                title={item.title}
                posterUrl={item.posterUrl || item.poster_url || item.poster}
                onPress={() => router.push(`/content/${item.id}`)}
                style={{ width: CARD_WIDTH }}
              />
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 400,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1235',
  },
  center: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 15,
  },
  carousel: {
    width: width,
  },
  itemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    color: '#B0A8C5',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF6464',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FFC864',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 15,
  },
  retryButtonText: {
    color: '#1E1235',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
