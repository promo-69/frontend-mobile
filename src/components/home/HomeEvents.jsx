import { ScrollView, StyleSheet, Text, View } from 'react-native';
import MovieCard from '../showtimes/MovieCard';

export default function HomeEvents({ events }) {
    if (!events || events.length === 0) {
    return (
      <Text style={styles.emptyText}>
        No hay eventos disponibles próximamente.
      </Text>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carouselContainer}
    >
      {events.map((event, index) => (
        <View
          key={`home-event-${event.id}-${index}`} 
          style={styles.cardWrapper}
        >
          <MovieCard movie={event} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 16,
},
carouselContainer: {
    paddingRight: 24,
    flexDirection: 'row',
},
cardWrapper: {
    marginRight: 24,
    width: 180,
},
});