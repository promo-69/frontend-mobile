import {  useState  } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Film, Calendar } from 'lucide-react-native';

export default function MovieGridCard({ movie, isEventsPage, upcoming, onPress }) {
  const [imageError, setImageError] = useState(false);

  if (!movie) return null;


  const title = movie.title || '';
  const posterUrl = movie.poster_url || movie.posterUrl || movie.banner_url || movie.bannerUrl;
  const dateText = movie.release_date || movie.date;

  const displayPlaceholder = !posterUrl || imageError;

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageWrapper}>
        {/* Placeholder en caso de que falle la carga o no exista URL */}
        {displayPlaceholder && (
          <View style={styles.placeholderContainer}>
            <Film size={36} color="#FFC864" strokeWidth={1.5} />
            <Text style={styles.placeholderText}>Cineflix</Text>
          </View>
        )}

        {/* Imagen de Póster con Transición Suave */}
        {posterUrl && !imageError && (
          <ExpoImage
            source={{ uri: posterUrl }}
            style={styles.posterImage}
            contentFit="cover"
            transition={250}
            onError={() => setImageError(true)}
          />
        )}

        {/* Badge flotante para Eventos Especiales */}
        {isEventsPage && (
          <View style={styles.eventBadge}>
            <Text style={styles.eventBadgeText}>Evento</Text>
          </View>
        )}
      </View>

      {/* Información del Título */}
      <Text style={styles.movieTitle} numberOfLines={2}>
        {title}
      </Text>

      {/* Fecha de estreno con icono (solo si es la pantalla de próximos estrenos) */}
      {upcoming && dateText && (
        <View style={styles.dateContainer}>
          <Calendar size={12} color="#9CA3AF" style={{ marginRight: 4 }} />
          <Text style={styles.dateText}>
            {dateText.split('-').reverse().join('/')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%', 
    marginBottom: 4,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 2 / 3, 
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1E1235',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#3D2563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#FFC864',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  movieTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 2,
  },
  eventBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#F6AD38',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 2,
  },
  dateText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
});