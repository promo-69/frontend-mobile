import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { formatTime12hrs } from '../../utils/TimeUtils';
import { useBottomSheet } from '../../context/BottomSheetContext';

const { width } = Dimensions.get('window');
// Ajustamos dinámicamente el ancho de la tarjeta para que quepan 2 por fila con sus márgenes comunes
const CARD_WIDTH = (width - 56) / 2;

export default function ShowtimeCard({ showtime, contentId, type }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showBottomSheet } = useBottomSheet();

  // Extraer las descripciones desde las relaciones del JSON
  const projectionType = showtime.projection_type?.description || 'Proyección Desconocida';
  const language = showtime.language?.description || 'Idioma Desconocido';
  
  // Acceso directo a la sala y validación de disponibilidad
  const roomName = showtime.booking.room?.name || 'Sala General';
  const isSoldOut = showtime.booking.room?.available_seats === 0; 
  
  // Formateador de hora militar a formato 12 horas (Ej: { time: '07:30', ampm: 'PM' })
  const { time, ampm } = formatTime12hrs(showtime.booking?.start_time);

  const formatBadgeText = (text) => {
    const upper = text.toUpperCase();
    if (upper.includes('IMAX')) return 'IMAX';
    if (upper.includes('4DX')) return '4DX';
    if (upper.includes('3D')) return '3D';
    return '2D';
  };

  const handleBookingPress = () => {
    if (isSoldOut) return;

    if (!isAuthenticated) {
      // Si el usuario no está autenticado, disparamos el BottomSheet global de Login
      showBottomSheet({
        title: 'Sesión Requerida',
        message: 'Inicia sesión en tu cuenta de Cineflix para agendar tus boletos.',
        primaryButton: {
          text: 'Iniciar Sesión',
          onPress: () => router.push('/login'),
        },  
    });
      return;
    }

    // Navegación segura hacia el flujo de reserva (Flujo de compra de boletos)
    // Pasamos el showtimeId, el id del contenido y el tipo para mapear la compra en el checkout
    router.push({
      pathname: '/buy/selectSeats',
      params: { 
        showtimeId: showtime.id,
        contentId: contentId,
        contentType: type 
      }
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={isSoldOut ? 1 : 0.7}
      onPress={handleBookingPress}
      style={[
        styles.cardContainer,
        isSoldOut && styles.cardDisabled
      ]}
    >
      {/* Reloj y Bloque Horario */}
      <View style={styles.timeContainer}>
        <Text style={[styles.hourText, isSoldOut && styles.textDisabled]}>
          {time}
        </Text>
        <Text style={[styles.ampmText, isSoldOut && styles.textDisabled]}>
          {" "}{ampm}
        </Text>
      </View>

      {/* Características Técnicas (Formato e Idioma) */}
      <View style={styles.specsContainer}>
        <View style={[styles.formatBadge, isSoldOut && styles.badgeDisabled]}>
          <Text style={[styles.formatText, isSoldOut && styles.textDisabled]}>
            {formatBadgeText(projectionType)}
          </Text>
        </View>
        <Text style={[styles.langText, isSoldOut && styles.textDisabled]} numberOfLines={1}>
          {language}
        </Text>
      </View>

      {/* Identificador de Sala / Badge de Agotado */}
      <View style={styles.roomContainer}>
        <Ionicons 
          name={isSoldOut ? "close-circle-outline" : "film-outline"} 
          size={14} 
          color={isSoldOut ? "#EF4444" : "#B0A8C5"} 
        />
        <Text style={[styles.roomText, isSoldOut && styles.roomSoldOutText]}>
          {isSoldOut ? 'AGOTADO' : roomName}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    color: 'rgba(255, 255, 255, 0.25)',
    textDecorationLine: 'line-through',
  },
  specsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 6,
    width: '100%'
  },
  formatBadge: {
    borderWidth: 1,
    borderColor: 'rgba(123, 26, 130, 0.5)',
    backgroundColor: 'rgba(123, 26, 130, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeDisabled: {
    borderColor: 'transparent',
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  },
  formatText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  langText: {
    color: '#B0A8C5',
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  roomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomText: {
    color: '#B0A8C5',
    fontSize: 11,
    fontWeight: '600',
  },
  roomSoldOutText: {
    color: '#EF4444',
    fontWeight: 'bold',
  }
});