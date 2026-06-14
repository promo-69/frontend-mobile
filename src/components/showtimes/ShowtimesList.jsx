import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ShowtimeCard from './ShowtimeCard';

export default function ShowtimesList({ showtimes, movieId, selectedDate }) {
 
  //Filtrar las funciones en tiempo real por la fecha seleccionada
  const filteredShowtimes = useMemo(() => {
    if (!Array.isArray(showtimes)) return [];
    
    return showtimes.filter((item) => {
      if (!item.start_time) return false;
      // Extrae la parte "YYYY-MM-DD" de forma más robusta (primeros 10 caracteres)
      const itemDate = item.start_time.substring(0, 10);
      return itemDate === selectedDate;
    });
  }, [showtimes, selectedDate]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Funciones Disponibles</Text>
      
      {filteredShowtimes.length > 0 ? (
        <View style={styles.gridContainer}>
        {filteredShowtimes.map((item) => (
          <ShowtimeCard key={item.id} showtime={item} movieId={movieId} />
        ))}
      </View>
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16, 
  },
  emptyText: {
    color: '#B0A8C5',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});
