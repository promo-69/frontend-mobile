import { StyleSheet, Text, View } from 'react-native';
import ShowtimeCard from './ShowtimeCard';

export default function ShowtimesList({ showtimes, movieId }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Funciones Disponibles</Text>
      {showtimes.length > 0 ? (
        showtimes.map((item) => (
          <ShowtimeCard key={item.id} showtime={item} movieId={movieId} />
        ))
      ) : (
        <Text style={styles.emptyText}>
          No hay funciones programadas para hoy.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 30, marginBottom: 40 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f4b400',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  emptyText: {
    color: '#B0A8C5',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});
