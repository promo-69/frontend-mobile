import { ScrollView, StyleSheet, View } from 'react-native';
import ContentSkeleton from '../showtimes/ContentSkeleton';
import MovieCard from '../showtimes/MovieCard';
import SectionHeader from '../ui/SectionHeader';
import {theme} from '../../constants'

export default function MovieCarousel({
  title,
  movies = [],
  loading = false,
  onSeeMore,
  onCardPress,
}) {
  return (
    <View style={styles.container}>
      <SectionHeader title={title} onSeeMore={onSeeMore} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading
          ? [1, 2, 3, 4].map((i) => <ContentSkeleton key={i} variant="card" />)
          : (movies || []).map((item) => (
              <MovieCard
                key={item.id}
                title={item.title || 'Título No Disponible'}
                posterUrl={item.poster_url}
                onPress={() => onCardPress(item)}
              />
            ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: theme.spacing.s15 ?? 15 },
  scrollContent: { paddingHorizontal: theme.spacing.s16 },
});
