import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MovieCard from './../showtimes/MovieCard';

export default function HomeReleases({ movies = [] }) {
  const router = useRouter();
  if (!movies.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>En Cartelera</Text>
        <TouchableOpacity
          style={styles.seeMoreBtn}
          onPress={() => router.push('/movies/releases')}
        >
          <Text style={styles.seeMoreText}>Ver Todo</Text>
          <ChevronRight size={14} color="#f4b400" />
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {movies.map((movie) => (
          <MovieCard
            key={`release-${movie.id}`}
            title={movie.title}
            posterUrl={movie.poster_url}
            onPress={() => router.push(`/(main)/movie/${movie.id}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#f4b400',
    fontSize: 17,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  seeMoreBtn: { flexDirection: 'row', alignItems: 'center' },
  seeMoreText: {
    color: '#B0A8C5',
    fontSize: 13,
    marginRight: 4,
    fontWeight: '600',
  },
});
