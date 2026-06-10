import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import MovieCard from '../showtimes/MovieCard';
import MovieSkeleton from '../showtimes/MovieSkeleton';

export default function MovieCarousel({ 
  title, 
  movies = [], 
  loading = false, 
  onSeeMore, 
  onCardPress
}) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeMore && (
          <TouchableOpacity style={styles.seeMoreBtn} onPress={onSeeMore}>
            <Text style={styles.seeMoreText}>Ver Todo</Text>
            <ChevronRight size={14} color="#f4b400" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          [1, 2, 3, 4].map((i) => <MovieSkeleton key={i} variant="card" />)
        ) : (
          (movies || []).map((movie) => (
            <MovieCard
              key={movie.id}
              title={movie.title || 'Título No Disponible'}
              posterUrl={movie.poster_url}
              onPress={() => onCardPress(movie)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 15 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#f4b400',
    fontSize: 17,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  seeMoreBtn: { flexDirection: 'row', alignItems: 'center' },
  seeMoreText: { color: '#B0A8C5', fontSize: 13, marginRight: 4, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 16 }
});