import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../constants';
import { formatTime12hrs } from '../../utils/TimeUtils';

export default function ShowtimeHeader({ movie, showtime }) {
  if (!movie || !showtime) return null;

  const roomName =
    showtime.booking?.room?.name ??
    showtime.booking?.room ??
    'Sala Desconocida';
  const formattedTime = formatTime12hrs(showtime.booking?.start_time) || {
    time: '',
    ampm: '',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.movieTitle}>
        {showtime.event?.title || showtime.movie?.title}
      </Text>
      <View style={styles.detailsRow}>
        <Text style={styles.detailText}>{roomName}</Text>
        <Text style={styles.detailSeparator}>•</Text>
        <Text style={styles.detailText}>
          {showtime.projection_type?.description || 'Tipo Desconocido'}
        </Text>
        <Text style={styles.detailSeparator}>•</Text>
        <Text style={styles.detailText}>
          {showtime.language?.description || 'Idioma Desconocido'}
        </Text>
      </View>
      <Text style={styles.timeText}>
        {formattedTime.time} {formattedTime.ampm}
      </Text>
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
    color: theme.colors.textPrimary,
    marginBottom: 5,
    textAlign: 'center',
    alignSelf: 'center',
    flexShrink: 1,
  },
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  detailText: { fontSize: 13, color: theme.colors.textDisabled },
  detailSeparator: {
    fontSize: 13,
    color: theme.colors.textDisabled,
    marginHorizontal: 5,
  },
  timeText: { fontSize: 16, fontWeight: 'bold', color: theme.colors.textAccent.gold },
});
