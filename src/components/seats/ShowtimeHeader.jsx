import { StyleSheet, Text, View } from 'react-native';

const COLORS = {
  textMain: '#FFFFFF',
  textGray: '#B0A8C5',
  accent: '#f4b400',
};

// Función para formatear la hora ISO a formato local (es-VE)
const formatTime = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export default function ShowtimeHeader({ movie, showtime }) {
  if (!movie || !showtime) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.movieTitle} numberOfLines={1}>
        {movie.title}
      </Text>
      <View style={styles.detailsRow}>
        <Text style={styles.detailText}>
          {showtime.room?.name || 'Sala Desconocida'}
        </Text>
        <Text style={styles.detailSeparator}>•</Text>
        <Text style={styles.detailText}>
          {showtime.projection_type?.description || 'Tipo Desconocido'}
        </Text>
        <Text style={styles.detailSeparator}>•</Text>
        <Text style={styles.detailText}>
          {showtime.language?.description || 'Idioma Desconocido'}
        </Text>
      </View>
      <Text style={styles.timeText}>{formatTime(showtime.start_time)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.3)', // Semi-transparente para superponer al gradiente
    alignItems: 'center',
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 5,
  },
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  detailText: { fontSize: 13, color: COLORS.textGray },
  detailSeparator: {
    fontSize: 13,
    color: COLORS.textGray,
    marginHorizontal: 5,
  },
  timeText: { fontSize: 16, fontWeight: 'bold', color: COLORS.accent },
});
