import { Image as ExpoImage } from 'expo-image';
import { Film } from 'lucide-react-native';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function MovieCard({ title, posterUrl, onPress }) {
  const [imageError, setImageError] = useState(false);

  // Si no hay url o la imagen ya dio error previo, usamos el estado para asegurar el fallback
  const displayPlaceholder = !posterUrl || imageError;

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageWrapper}>
        {/* Se muestra solo si no hay imagen válida */}
        {displayPlaceholder && (
          <View style={styles.placeholderContainer}>
            <Film size={40} color="#FFC864" strokeWidth={1.5} />
            <Text style={styles.placeholderText}>Cineflix</Text>
          </View>
        )}

        {/* Imagen Principal */}
        {posterUrl && !imageError && (
          <ExpoImage
            source={{ uri: posterUrl }}
            style={styles.posterImage}
            contentFit="cover"
            transition={300} // Animación de fundido suave al cargar
            onError={() => setImageError(true)} // Si el link está roto o da 404, activa el repuesto
          />
        )}
      </View>

      <Text style={styles.movieTitle} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 200,
    marginRight: 15,
    alignItems: 'center',
  },
  imageWrapper: {
    width: 200,
    height: 300,
    borderRadius: 20,
    overflow: 'hidden', // Corta los bordes de la imagen o del placeholder
    backgroundColor: '#1E1235', // Fondo morado muy oscuro de respaldo
    // Sombras nativas
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  // Contenedor del diseño de repuesto
  placeholderContainer: {
    ...StyleSheet.absoluteFillObject, // Ocupa exactamente todo el espacio del wrapper
    backgroundColor: '#3D2563', // Morado intermedio para que resalte el icono
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  placeholderText: {
    color: '#B0A8C5',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  movieTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
});
