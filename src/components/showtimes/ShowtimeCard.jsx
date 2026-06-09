import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useBottomSheet } from '../../context/BottomSheetContext';

const formatTime = (isoString) => {
  const date = new Date(isoString);
  // Asegúrate de que 'es-VE' sea un locale soportado o usa un fallback
  return date.toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export default function ShowtimeCard({ showtime, movieId }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showBottomSheet } = useBottomSheet();

  const handleSelectShowtime = () => {
    if (isAuthenticated) {
      router.push(`/selectSeats?movieId=${movieId}&showtimeId=${showtime.id}`);
    } else {
      showBottomSheet({
        title: '¡Casi listo!',
        message:
          'Para seleccionar tus asientos y continuar con la compra, necesitas iniciar sesión en tu cuenta de Cineflix.',
        type: 'auth',
        primaryButton: {
          text: 'Iniciar Sesión',
          onPress: () => router.push('/(auth)/login'),
        },
        secondaryButton: {
          text: 'Tal vez luego',
        },
      });
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handleSelectShowtime}>
      <View>
        <Text style={styles.time}>{formatTime(showtime.start_time)}</Text>
        <Text style={styles.details}>
          {showtime.projection_type?.description} •{' '}
          {showtime.language?.description}
        </Text>
        <Text style={styles.room}>{showtime.room?.name}</Text>
      </View>
      <View style={styles.priceTag}>
        <Text style={styles.price}>
          {showtime.currency?.symbol}
          {showtime.price}
        </Text>
        <Ionicons name="chevron-forward" size={18} color="#f4b400" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  time: { color: '#f4b400', fontSize: 20, fontWeight: 'bold' },
  details: { color: '#B0A8C5', fontSize: 12, marginTop: 2 },
  room: { color: '#FFFFFF', fontSize: 11, marginTop: 4, opacity: 0.7 },
  priceTag: { flexDirection: 'row', alignItems: 'center' },
  price: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
});
