import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Phone, Clock, Building2 } from 'lucide-react-native';

export default function CinemaCard({ cinema, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
    >
      {/* Contenedor de la imagen */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              cinema.posterUrl ||
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000',
          }}
          style={styles.cinemaImage}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={['transparent', 'rgba(24, 15, 42, 0.6)']}
          style={styles.gradientOverlay}
        />
      </View>

      {/*Seccion inferior*/}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {cinema.name}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#231640',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 100, 0.08)',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9, // Mantiene la consistencia panorámica tipo cine
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cinemaImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  infoContainer: {
    padding: 14,
    backgroundColor: 'rgba(35, 22, 64, 0.4)',
  },
  name: {
    color: '#FFC864',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
