import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SeatLegend from '../../../components/seats/SeatLegend';
import SeatMap from '../../../components/seats/SeatMap';
import ShowtimeHeader from '../../../components/seats/ShowtimeHeader';
import ZoomableContainer from '../../../components/seats/ZoomableContainer';
import { useCart } from '../../../context/CartContext'; // Asumiendo que CartContext existe
import { getMovieById } from '../../../services/movies.service';
import {
  getShowtimeById,
  getShowtimeSeats,
} from '../../../services/showtimes.service';

const COLORS = {
  bgDeep: '#231640', // Morado profundo
  bgDarker: '#2D1748', // Tono más oscuro de morado
  accent: '#D9982F', // Dorado para el botón principal
  textMain: '#FFFFFF',
  textGray: '#B0A8C5',
  buttonText: '#000000',
};

export default function SelectSeats() {
  const params = useLocalSearchParams();
  console.log('SelectSeats params raw:', params);

  const { movieId, showtimeId } = useLocalSearchParams();
  const router = useRouter();
  const { cart, toggleSeat, updateCartDetails, totalAmount } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movie, setMovie] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [seatsData, setSeatsData] = useState([]);

  useEffect(() => {
    async function loadData() {
      if (!movieId || !showtimeId) {
        setError('Movie ID or Showtime ID missing.');
        setLoading(false);
        return;
      }

      try {
        const [movieResponse, showtimeResponse, seatsResponse] =
          await Promise.all([
            getMovieById(movieId),
            getShowtimeById(showtimeId),
            getShowtimeSeats(showtimeId),
          ]);

        // Normalizamos la data: el backend devuelve arrays incluso para consultas por ID
        const cleanMovie = Array.isArray(movieResponse)
          ? movieResponse[0]
          : movieResponse;
        const cleanShowtime = Array.isArray(showtimeResponse)
          ? showtimeResponse[0]
          : showtimeResponse;

        // Para los asientos, manejamos si la respuesta es el objeto directo o un array
        const cleanSeatsObj = Array.isArray(seatsResponse)
          ? seatsResponse
          : seatsResponse;

        setMovie(cleanMovie);
        setShowtime(cleanShowtime);
        setSeatsData(cleanSeatsObj?.seats || []);
        updateCartDetails(cleanMovie, cleanShowtime); // Actualiza el carrito con los detalles de la película y la función
      } catch (err) {
        console.error('Error loading seat selection data:', err);
        setError('Failed to load movie or showtime details. Please try again.');
        Alert.alert(
          'Error',
          'No se pudieron cargar los detalles para la selección de asientos.'
        );
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [movieId, showtimeId]); //evaluemos si updateCartDetails causa re-renders infinitos

  const handleContinueToPayment = () => {
    if (cart.tickets.length === 0) {
      Alert.alert(
        'Selección de Asientos',
        'Por favor, selecciona al menos un asiento.'
      );
      return;
    }
    // Navegar al paso de selección de categoría de boleto
    router.push({ pathname: '/(buy)/tickets', params: { showtimeId } });
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[COLORS.bgDeep, COLORS.bgDarker]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Cargando asientos...</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={[COLORS.bgDeep, COLORS.bgDarker]}
        style={styles.loadingContainer}
      >
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  if (error || !movie || !showtime || seatsData.length === 0) {
    return (
      <LinearGradient
        colors={[COLORS.bgDeep, COLORS.bgDarker]}
        style={styles.loadingContainer}
      >
        <Text style={styles.errorText}>
          {error || 'No hay asientos disponibles o la función no existe'}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const selectedSeatNames = cart.tickets
    .map((t) => `${t.row}${t.column}`)
    .join(', ');

  return (
    <SafeAreaView style={styles.fullScreen}>
      <LinearGradient
        colors={[COLORS.bgDeep, COLORS.bgDarker]}
        style={StyleSheet.absoluteFill}
      />

      <ShowtimeHeader movie={movie} showtime={showtime} />
      <SeatLegend />

      <View style={styles.mapViewport}>
        <ZoomableContainer>
          <SeatMap
            seatsData={seatsData}
            selectedSeats={cart.tickets}
            onToggleSeat={toggleSeat}
          />
        </ZoomableContainer>
      </View>

      {/** Accion flotante */}
      {cart.tickets.length > 0 && (
        <View style={styles.bottomActionBar}>
          <Text style={styles.summaryText}>
            Asientos elegidos: {selectedSeatNames}
          </Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinueToPayment}
          >
            <Text style={styles.continueButtonText}>
              Continuar al pago ({showtime.currency?.symbol || '$'}
              {totalAmount.toFixed(2)})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { color: COLORS.textGray, marginTop: 10, fontSize: 16 },
  errorText: {
    color: COLORS.textMain,
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.buttonText,
    fontWeight: 'bold',
  },
  mapViewport: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, //Espacio libre para que la ultima fila no se oculte detrás del footer
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(23, 14, 43, 0.95)',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 30, // Espacio para el safe area inferior
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  summaryText: { color: COLORS.textGray, fontSize: 14, marginBottom: 10 },
  continueButton: {
    backgroundColor: COLORS.accent,
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueButtonText: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
