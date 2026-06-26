import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SeatLegend from '../../../components/seats/SeatLegend';
import SeatMap from '../../../components/seats/SeatMap';
import ShowtimeHeader from '../../../components/seats/ShowtimeHeader';
import { useCart } from '../../../context/CartContext';
import { useSeatLock } from '../../../hooks/buy/useSeatLock';
import { getMovieById } from '../../../services/movies.service';
import {
  getShowtimeById,
  getShowtimeSeats,
} from '../../../services/showtimes.service';
import { createQuote, cancelSession } from '../../../services/orders.service';

const COLORS = {
  bgDeep: '#231640', // Morado profundo
  bgDarker: '#2D1748', // Tono más oscuro de morado
  accent: '#D9982F', // Dorado para el botón principal
  textMain: '#FFFFFF',
  textGray: '#B0A8C5',
  buttonText: '#000000',
};

export default function SelectSeats() {
  const { movieId, showtimeId, cinemaId } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const {
    cart,
    toggleSeat,
    updateTickets,
    updateCartDetails,
    clearCart,
    clearProducts,
  } = useCart();

  // Marca si estamos avanzando en el flujo (no debemos liberar locks al avanzar)
  const advancingRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movie, setMovie] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [seatsData, setSeatsData] = useState([]);
  // Overrides de estado en tiempo real: seatId -> 'occupied' | 'available'
  const [liveSeatStatus, setLiveSeatStatus] = useState({});
  const [lockingSeatId, setLockingSeatId] = useState(null);
  // Indica que la quote ya fue creada → habilita la conexión en tiempo real
  const [quoteReady, setQuoteReady] = useState(false);

  // Marca asientos como ocupados cuando otros usuarios los toman o compran
  const handleSeatsTakenByOthers = useCallback(
    (payload) => {
      // El backend puede emitir un array directo, o un objeto { seatIds }/{ seats }
      const seatIds = Array.isArray(payload)
        ? payload
        : (payload?.seatIds ??
          payload?.seats ??
          (payload?.seatId != null ? [payload.seatId] : []));
      if (!seatIds.length) return;
      setLiveSeatStatus((prev) => {
        const next = { ...prev };
        for (const id of seatIds) next[id] = 'occupied';
        return next;
      });
      // Si alguno de esos asientos estaba en nuestro carrito, lo quitamos
      seatIds.forEach((id) => {
        if (cart.tickets.some((t) => t.seatId === id)) {
          toggleSeat(id, {});
        }
      });
    },
    [cart.tickets, toggleSeat]
  );

  // Libera asientos (vuelven a disponibles) cuando otros los sueltan
  const handleSeatsReleased = useCallback(
    (payload) => {
      const seatIds = Array.isArray(payload)
        ? payload
        : (payload?.seatIds ??
          payload?.seats ??
          (payload?.seatId != null ? [payload.seatId] : []));
      if (!seatIds.length) return;
      setLiveSeatStatus((prev) => {
        const next = { ...prev };
        for (const id of seatIds) {
          // Solo liberamos si no es nuestro asiento seleccionado
          if (!cart.tickets.some((t) => t.seatId === id)) {
            next[id] = 'available';
          }
        }
        return next;
      });
    },
    [cart.tickets]
  );

  const handleQuoteExpired = useCallback(() => {
    Alert.alert(
      'Sesión expirada',
      'Tu tiempo de reserva ha expirado. Vuelve a seleccionar tus asientos.',
      [{ text: 'Entendido', onPress: () => router.back() }]
    );
  }, [router]);

  const { joined, realtimeReady, lockSeat, unlockSeat, leave } = useSeatLock(
    showtimeId,
    {
      onSeatsTakenByOthers: handleSeatsTakenByOthers,
      onSeatsReleased: handleSeatsReleased,
      onQuoteExpired: handleQuoteExpired,
    },
    quoteReady
  );

  // Volver atrás liberando los bloqueos y cancelando la sesión de compra
  const handleGoBack = useCallback(async () => {
    leave();
    await cancelSession().catch(() => {});
    router.back();
  }, [leave, router]);

  // Interceptar cualquier salida hacia atrás (header, gesto, botón Android)
  // para liberar los bloqueos y vaciar el carrito. Si avanzamos, no hacemos nada.
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (advancingRef.current) return; // avanzando: conservar locks y carrito
      // Salida hacia atrás: liberar locks, cancelar sesión y vaciar carrito
      leave();
      cancelSession().catch(() => {});
      clearCart();
    });
    return unsubscribe;
  }, [navigation, leave, clearCart]);

  // En móvil, cerrar la app o mandarla a segundo plano NO dispara 'beforeRemove',
  // así que los asientos quedarían retenidos. Al pasar a segundo plano liberamos
  // los bloqueos y cancelamos la sesión de compra (cancelSession es lo que el
  // backend usa para soltar los asientos del usuario), salvo que estemos
  // avanzando en el flujo de compra.
  //
  // IMPORTANTE: solo reaccionamos a 'background' (app realmente en segundo plano),
  // NO a 'inactive': en iOS 'inactive' se emite en transiciones momentáneas
  // (abrir un Alert, el selector de apps, una llamada), y cancelar ahí rompería
  // el flujo de compra en curso.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (advancingRef.current) return;
      if (state === 'background') {
        leave();
        cancelSession().catch(() => {});
        clearCart();
      }
    });
    return () => sub.remove();
  }, [leave, clearCart]);

  useEffect(() => {
    async function loadData() {
      if (!movieId || !showtimeId) {
        setError('Falta el ID de la película o de la función.');
        setLoading(false);
        return;
      }
      if (!cinemaId) {
        setError('No se recibió la sucursal. Vuelve atrás e intenta de nuevo.');
        setLoading(false);
        return;
      }

      try {
        // 1. Abrir la sesión de compra (quote) ANTES de pedir el seat-map.
        //    Esto permite que el backend devuelva el pricing matrix con precios
        //    reales por categoría de audiencia.
        //    Si ya existe una sesión activa (409), la cancelamos y reintentamos.
        const openQuote = async (attempt = 0) => {
          try {
            await createQuote(Number(cinemaId));
          } catch (e) {
            const status = e?.response?.status;
            if ((status === 409 || status === 400) && attempt < 1) {
              // Sesión previa colgada → cancelarla y reintentar una vez
              await cancelSession().catch(() => {});
              await new Promise((r) => setTimeout(r, 400));
              return openQuote(attempt + 1);
            }
            throw e;
          }
        };

        await cancelSession().catch(() => {});

        // Si el carrito tiene confitería de OTRA sucursal, la descartamos: la
        // sesión de compra es por sucursal y el checkout rechazaría productos
        // que no existen en el inventario de la sucursal de esta función.
        if (
          cart.products.length > 0 &&
          cart.cinemaId &&
          Number(cart.cinemaId) !== Number(cinemaId)
        ) {
          clearProducts();
          Alert.alert(
            'Confitería de otra sucursal',
            'Tu confitería era de otra sucursal y se vació, porque la película que elegiste es de una sucursal distinta. Puedes volver a agregar productos de esta sucursal más adelante.'
          );
        }

        await openQuote();
        // Quote lista → habilitamos la conexión en tiempo real (join_showtime)
        setQuoteReady(true);
        // Empezamos la selección de cero: los bloqueos son nuevos por sesión,
        // así que descartamos asientos que pudieran haber quedado en el carrito.
        updateTickets([]);

        // 2. Cargar película, función y mapa de asientos (ya con quote activa)
        const [movieResponse, showtimeResponse, seatsResponse] =
          await Promise.all([
            getMovieById(movieId),
            getShowtimeById(showtimeId),
            getShowtimeSeats(showtimeId),
          ]);

        // Normalizamos la data: el backend puede devolver arrays para consultas por ID
        const cleanMovie = Array.isArray(movieResponse)
          ? movieResponse[0]
          : movieResponse;
        const cleanShowtime = Array.isArray(showtimeResponse)
          ? showtimeResponse[0]
          : showtimeResponse;
        const cleanSeatsObj = Array.isArray(seatsResponse)
          ? seatsResponse[0]
          : seatsResponse;

        // El booking id es necesario para el checkout (uno por función)
        const bookingId =
          cleanSeatsObj?.booking_id ?? cleanShowtime?.booking?.id ?? null;

        // Capturamos el pricing matrix mientras la quote está fresca, para que
        // la pantalla de Boletos lo lea del carrito sin volver a pedirlo.
        const pricingMatrix =
          cleanSeatsObj?.pricing?.pricing_matrix ??
          cleanSeatsObj?.pricing?.matrix ??
          [];

        setMovie(cleanMovie);
        setShowtime(cleanShowtime);
        setSeatsData(cleanSeatsObj?.seats || []);

        // 3. Guardar en el carrito los detalles + sucursal + booking + pricing
        updateCartDetails(cleanMovie, cleanShowtime, {
          cinemaId: Number(cinemaId),
          booking: bookingId,
          pricingMatrix,
        });
      } catch (err) {
        console.error('Error cargando la selección de asientos:', err);
        setError(
          'No se pudieron cargar los detalles para la selección de asientos.'
        );
        Alert.alert(
          'Error',
          err?.response?.data?.message ||
            'No se pudieron cargar los detalles para la selección de asientos.'
        );
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [movieId, showtimeId, cinemaId]);

  // Selección de asiento con bloqueo en tiempo real:
  //  - Al seleccionar: pedir lock al backend; solo añadir al carrito si confirma.
  //  - Al deseleccionar: liberar el lock.
  const handleToggleSeat = useCallback(
    async (seatId, seatData) => {
      const isSelected = cart.tickets.some((t) => t.seatId === seatId);
      const bookingId = cart.booking ?? showtime?.booking?.id ?? null;

      if (isSelected) {
        // Deseleccionar: liberar el lock y quitar del carrito
        unlockSeat(seatId);
        toggleSeat(seatId, { ...seatData, booking: bookingId });
        return;
      }

      // Seleccionar: esperar a que el tiempo real esté listo (o en modo degradado)
      if (!realtimeReady) {
        Alert.alert(
          'Un momento',
          'Aún estamos preparando la sala. Intenta de nuevo en un segundo.'
        );
        return;
      }

      setLockingSeatId(seatId);
      try {
        await lockSeat(seatId);
        // Confirmado por el backend → añadir al carrito
        toggleSeat(seatId, { ...seatData, booking: bookingId });
      } catch (err) {
        // El asiento fue tomado por otro o expiró: marcar ocupado
        setLiveSeatStatus((prev) => ({ ...prev, [seatId]: 'occupied' }));
        Alert.alert(
          'Asiento no disponible',
          err?.message || 'Ese asiento acaba de ser ocupado. Elige otro.'
        );
      } finally {
        setLockingSeatId(null);
      }
    },
    [
      cart.tickets,
      cart.booking,
      showtime,
      realtimeReady,
      lockSeat,
      unlockSeat,
      toggleSeat,
    ]
  );

  const handleContinueToPayment = () => {
    if (cart.tickets.length === 0) {
      Alert.alert(
        'Selección de Asientos',
        'Por favor, selecciona al menos un asiento.'
      );
      return;
    }
    // Marcamos que avanzamos para que el listener no libere los bloqueos
    advancingRef.current = true;
    // Continuar al paso de selección de categoría de boleto, propagando contexto
    router.push({
      pathname: '/(buy)/tickets',
      params: { showtimeId, movieId, cinemaId },
    });
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

  // Superponemos el estado en tiempo real sobre los asientos base
  const displaySeats = seatsData.map((seat) => {
    const override = liveSeatStatus[seat.id];
    if (!override) return seat;
    // No sobrescribimos el estado de un asiento que el propio usuario tiene seleccionado
    const isMine = cart.tickets.some((t) => t.seatId === seat.id);
    if (isMine) return seat;
    return { ...seat, status: override };
  });

  return (
    <SafeAreaView style={styles.fullScreen}>
      <LinearGradient
        colors={[COLORS.bgDeep, COLORS.bgDarker]}
        style={StyleSheet.absoluteFill}
      />

      <ShowtimeHeader movie={movie} showtime={showtime} />

      {/* Indicador de conexión en tiempo real (solo mientras se prepara) */}
      {!realtimeReady && (
        <View style={styles.connectionBanner}>
          <ActivityIndicator size="small" color={COLORS.accent} />
          <Text style={styles.connectionText}>Preparando la sala...</Text>
        </View>
      )}

      <View style={styles.mapViewport}>
        <View style={styles.gridCard}>
          <SeatMap
            seatsData={displaySeats}
            selectedSeats={cart.tickets}
            onToggleSeat={handleToggleSeat}
          />
        </View>
        <SeatLegend />
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
            disabled={lockingSeatId !== null}
          >
            <Text style={styles.continueButtonText}>
              Continuar · {cart.tickets.length}{' '}
              {cart.tickets.length === 1 ? 'asiento' : 'asientos'}
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
  connectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  connectionText: { color: COLORS.textGray, fontSize: 13 },
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  gridCard: {
    flex: 1,
    backgroundColor: 'rgba(60, 36, 90, 0.35)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(157, 91, 181, 0.25)',
    paddingVertical: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(23, 14, 43, 0.95)',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 30,
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
