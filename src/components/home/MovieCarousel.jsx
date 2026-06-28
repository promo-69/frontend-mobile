import { ScrollView, StyleSheet, View, Text } from 'react-native';
import ContentSkeleton from '../showtimes/ContentSkeleton';
import MovieCard from '../movies/MovieCard';
import SectionHeader from '../ui/SectionHeader';
import {theme} from '../../constants'

export default function MovieCarousel({
  title,
  subtitle,
  movies = [],
  loading = false,
  onSeeMore,
  onCardPress,
}) {
  return (
    <View style={styles.container}>
     {/* Cabecera del Carrusel */}
      <View style={styles.headerWrapper}>
        <SectionHeader title={title} onSeeMore={onSeeMore} />
        {subtitle && (
          <Text style={styles.sectionSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
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
  container: { 
    marginVertical: theme.spacing.s16,
  },
  headerWrapper: {
    paddingHorizontal: theme.spacing.s16,
    marginBottom: theme.spacing.s12,
  },
  sectionSubtitle: {
    ...theme.typography.variants.caption,
    color: theme.colors.textDisabled,
    fontFamily: theme.typography.family.primary.medium,
    marginTop: -theme.spacing.s4, // Ajuste sutil para pegarlo al SectionHeader
  },
  scrollContent: { 
    paddingHorizontal: theme.spacing.s16,
    gap: theme.spacing.s12, // Mantiene separación limpia entre MovieCards
  },

});