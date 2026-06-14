import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { formatTime12hrs } from '../../utils/TimeUtils'
import { useBottomSheet } from '../../context/BottomSheetContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 56) / 2;

export default function ShowtimeCard({ showtime, movieId }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showBottomSheet } = useBottomSheet();

  //Extraer las descripciones
  const projectionType = showtime.projection_type?.description ||  'Proyección Desconocida';
  const language = showtime.language?.description || 'Idioma Desconocido';
  const roomName = showtime.booking?.room?.name || 'Sala General';
  const availableSeats= showtime.booking?.room?.available_seats;
  const isSoldOut = availableSeats === 0;
  
  const { time, ampm } = formatTime12hrs(showtime.start_time);

  const formatBadgeText = (text) => {
    const upper = text.toUpperCase();
    if (upper.includes('IMAX')) return 'IMAX';
    if (upper.includes('4DX')) return '4DX';
    if (upper.includes('3D')) return '3D';
    return '2D';
  };

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
          onPress: () => router.push('/login'),
        },
        secondaryButton: {
          text: 'Tal vez luego',
        },
      });
    }
  };

return (
    <TouchableOpacity
      activeOpacity={isSoldOut ? 1 : 0.7}
      disabled={isSoldOut}
      onPress={handleSelectShowtime}
      style={[
        styles.cardContainer,
        isSoldOut && styles.cardDisabled
      ]}
    >
      {/* Bloque de Hora */}
      <View style={styles.timeContainer}>
        <Text style={[styles.hourText, isSoldOut && styles.textDisabled]}>
          {time}
        </Text>
        <Text style={[styles.ampmText, isSoldOut && styles.textDisabled]}>
          {ampm}
        </Text>
      </View>

      {/* Bloque de Especificaciones */}
      <View style={[styles.specsContainer, isSoldOut && { opacity: 0.3 }]}>
        {/* Contenedor con borde para el formato */}
        <View style={styles.formatBadge}>
          <Text style={styles.formatText}>
            {formatBadgeText(projectionType)}
          </Text>
        </View>

        {/* Divisor vertical delgado */}
        <View style={styles.verticalDivider} />

        {/* Texto del idioma */}
        <Text style={styles.langText}>
          {language.toUpperCase().substring(0, 3)}
        </Text>
      </View>

      {/* Nombre de la Sala */}
      <Text style={[styles.roomText, isSoldOut && styles.soldOutText]}>
        {isSoldOut ? 'AGOTADO' : roomName}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 20,
    borderRadius: 15,
    paddingHorizontal: 12,
    width: CARD_WIDTH,
    height: CARD_WIDTH * 0.85, // Mantiene una proporción rectangular-cuadrada perfecta
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderColor: 'rgba(255, 255, 255, 0.02)',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  hourText: { 
    color: '#f4b400', 
    fontSize: 26, 
    fontWeight: 'bold' 
  },
  ampmText: { 
    color: '#B0A8C5', 
    fontSize: 14, 
    marginTop: 2 
  },
  textDisabled: {
    color: 'rgba(255, 255, 255, 0.3)',
    textDecorationLine: 'line-through', // Raya la hora para indicar que no está disponible
  },
  specsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  formatBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  formatText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  verticalDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 10,
  },
  langText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  roomText: { 
    color: '#FFFFFF', 
    fontSize: 12, 
    fontWeight: '500'
  },
  soldOutText: {
    color: '#ef4444',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  }
});
