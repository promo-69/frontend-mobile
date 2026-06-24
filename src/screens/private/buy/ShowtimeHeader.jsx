import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { formatTime12hrs } from '../../utils/TimeUtils';

const COLORS = {
  textMain: '#FFFFFF',
  textGray: '#D8CFEA',
  accent: '#F6AD38',
};

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

  // Imagen de fondo: preferimos banner; si no, el póster. Puede venir del
  // objeto movie o del showtime (evento/película).
  const bgImage =
    movie?.banner_url ||
    movie?.poster_url ||
    showtime?.movie?.banner_url ||
    showtime?.movie?.poster_url ||
    showtime?.event?.banner_url ||
    showtime?.event?.poster_url ||
    null;

  const title =
    showtime.event?.title || showtime.movie?.title || movie?.title || '';

  return (
    <View style={styles.container}>
      {/* Imagen de fondo del póster/banner */}
      {bgImage && (
        <Image
          source={{ uri: bgImage }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
        />
      )}
      {/* Degradado para legibilidad del texto sobre la imagen */}
      <LinearGradient
        colors={[
          'rgba(35,22,64,0.55)',
          'rgba(35,22,64,0.80)',
          'rgba(35,22,64,0.97)',
        ]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Text style={styles.movieTitle} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>{roomName}</Text>
          <Text style={styles.detailSeparator}>•</Text>
          <Text style={styles.detailText}>
            {showtime.projection_type?.description || 'Tipo'}
          </Text>
          <Text style={styles.detailSeparator}>•</Text>
          <Text style={styles.detailText}>
            {showtime.language?.description || 'Idioma'}
          </Text>
        </View>
        <View style={styles.timePill}>
          <Text style={styles.timeText}>
            {formattedTime.time} {formattedTime.ampm}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 140,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  content: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  movieTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: { fontSize: 13, color: COLORS.textGray },
  detailSeparator: {
    fontSize: 13,
    color: COLORS.textGray,
    marginHorizontal: 6,
  },
  timePill: {
    backgroundColor: 'rgba(246,173,56,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(246,173,56,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.accent,
    letterSpacing: 0.5,
  },
});
