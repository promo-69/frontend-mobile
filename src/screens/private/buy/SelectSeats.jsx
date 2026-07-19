import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { usePurchaseSession } from '../../../context/PurchaseSessionContext';
import { useSeatLock } from '../../../hooks/buy/useSeatLock';
import { getMovieById } from '../../../services/movies.service';
import {
  getShowtimeById,
  getShowtimeSeats,
} from '../../../services/showtimes.service';

const COLORS = {
  bgDeep: '#231640',
  bgDarker: '#2D1748',
  accent: '#D9982F',
  textMain: '#FFFFFF',
  textGray: '#B0A8C5',
  buttonText: '#000000',
};

export default function SelectSeats() {
  const { movieId, showtimeId, cinemaId, plan } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const {
    cart,
    toggleSeat,
    updateTickets,
    updateCartDetails,
  } = useCart();

  // La sesión de compra (quote) ya la abrió la pantalla de boletos vía el provider.
  // initSession se usa para auto-recuperar la quote si expiró en Redis.
  const { quoteReady, initSession } = usePurchaseSession();

  // Plan de boletos: un audienceCategoryId por cada boleto solicitado.
  const ticketPlan = useMemo(() => {
    try {
      return plan ? JSON.parse(plan) : [];
    } catch {
      return [];
    }
  }, [plan]);
  const maxSeats = ticketPlan.length;

  const advancingRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movie, setMovie] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [seatsData, setSeatsData] = useState([]);
  const [liveSeatStatus, setLiveSeatStatus] = useState({});
  const [lockingSeatId, setLockingSeatId] = useState(null);

  const handleSeatsTakenByOthers = useCallback(
    (payload) => {
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
      seatIds.forEach((id) => {
        if (cart.tickets.some((t) => t.seatId === id)) toggleSeat(id, {});
      });
    },
    [cart.tickets, toggleSeat]
  );

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
          if (!cart.tickets.some((t) => t.seatId === id)) next[id] = 'available';
        }
        return next;
      });
    },
    [cart.tickets]
  );

  const handleQuoteExpired = useCallback(() => {
    Alert.alert(
      'Sesión expirada',
      'Tu tiempo de reserva ha expirado. Vuelve a empezar la compra.',
      [{ text: 'Entendido', onPress: () => router.back() }]
    );
  }, [router]);

  const { realtimeReady, lockSeat, unlockSeat, leave } = useSeatLock(
    showtimeId,
    {
      onSeatsTakenByOthers: handleSeatsTakenByOthers,
      onSeatsReleased: handleSeatsReleased,
      onQuoteExpired: handleQuoteExpired,
    },
    // Solo habilitamos el tiempo real cuando la quote está lista.
    quoteReady
  );

  // Volver atrás (a la selección de boletos): se liberan los LOCKS de asientos,
  // pero no se cancela la sesión de compra: el provider es su único dueño y la
  // mantiene mientras se siga dentro del flujo (buy). Al salir del grupo, el
  // provider la cancela.
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (advancingRef.current) return; // avanzando: conservar locks
      leave(); // liberar asientos bloqueados por este usuario
      updateTickets([]); // limpiar selección de asientos
    });
    return unsubscribe;
  }, [navigation, leave, updateTickets]);

  // En segundo plano se liberan los locks (para no retener asientos), sin tocar
  // la sesión de compra.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (advancingRef.current) return;
      if (state === 'background') leave();
    });
    return () => sub.remove();
  }, [leave]);

  useEffect(() => {
    async function loadData() {
      if (!movieId || !showtimeId) {
        setError('Falta el ID de la película o de la función.');
        setLoading(false);
        return;
      }
      if (maxSeats === 0) {
        setError('Vuelve atrás y elige cuántos boletos quieres.');
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

        const cleanMovie = Array.isArray(movieResponse)
          ? movieResponse[0]
          : movieResponse;
        const cleanShowtime = Array.isArray(showtimeResponse)
          ? showtimeResponse[0]
          : showtimeResponse;
        const cleanSeatsObj = Array.isArray(seatsResponse)
          ? seatsResponse[0]
          : seatsResponse;

        const bookingId =
          cleanSeatsObj?.booking_id ?? cleanShowtime?.booking?.id ?? null;

        const pricingMatrix =
          cleanSeatsObj?.pricing?.pricing_matrix ??
          cleanSeatsObj?.pricing?.matrix ??
          cart.pricingMatrix ??
          [];

        setMovie(cleanMovie);
        setShowtime(cleanShowtime);
        setSeatsData(cleanSeatsObj?.seats || []);
        updateTickets([]);

        updateCartDetails(cleanMovie, cleanShowtime, {
          cinemaId: Number(cinemaId),
          booking: bookingId,
          pricingMatrix,
        });
      } catch (err) {
        console.error('Error cargando la selección de asientos:', err);
        setError('No se pudieron cargar los asientos.');
        Alert.alert(
          'Error',
          err?.response?.data?.message || 'No se pudieron cargar los asientos.'
        );
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [movieId, showtimeId, cinemaId, maxSeats]);

  const handleToggleSeat = useCallback(
    async (seatId, seatData) => {
      const isSelected = cart.tickets.some((t) => t.seatId === seatId);
      const bookingId = cart.booking ?? showtime?.booking?.id ?? null;

      if (isSelected) {
        unlockSeat(seatId);
        toggleSeat(seatId, { ...seatData, booking: bookingId });
        return;
      }

      // Límite: no permitir más asientos que boletos solicitados.
      if (cart.tickets.length >= maxSeats) {
        Alert.alert(
          'Límite de boletos',
          `Elegiste ${maxSeats} boleto${maxSeats === 1 ? '' : 's'}. Deselecciona uno para cambiarlo.`
        );
        return;
      }

      if (!realtimeReady) {
        Alert.alert(
          'Un momento',
          'Aún estamos preparando la sala. Intenta de nuevo en un segundo.'
        );
        return;
      }

      setLockingSeatId(seatId);
      try {
        try {
          await lockSeat(seatId);
        } catch (err) {
          // Si la quote expiró en Redis, la recreamos y reintentamos UNA vez
          // en lugar de dejar al usuario bloqueado sin poder continuar.
          // force: el provider puede creer que su quote sigue viva (estado
          // local desactualizado), así que lo obligamos a recrearla.
          const msg = err?.message || '';
          const sessionGone = /sesión de compra|expirad/i.test(msg);
          if (!sessionGone) throw err;

          const recovered = await initSession(Number(cinemaId), { force: true });
          if (!recovered) throw err;
          await lockSeat(seatId);
        }
        toggleSeat(seatId, { ...seatData, booking: bookingId });
      } catch (err) {
        const msg = err?.message || '';
        // Solo marcamos el asiento como ocupado si el error es del asiento;
        // un problema de sesión no significa que el asiento esté tomado.
        if (!/sesión de compra|expirad/i.test(msg)) {
          setLiveSeatStatus((prev) => ({ ...prev, [seatId]: 'occupied' }));
          Alert.alert(
            'Asiento no disponible',
            msg || 'Ese asiento acaba de ser ocupado. Elige otro.'
          );
        } else {
          Alert.alert(
            'Sesión de compra expirada',
            'No pudimos renovar tu sesión de compra. Vuelve a la selección de boletos para reiniciar el proceso.'
          );
        }
      } finally {
        setLockingSeatId(null);
      }
    },
    [
      cart.tickets,
      cart.booking,
      showtime,
      realtimeReady,
      maxSeats,
      lockSeat,
      unlockSeat,
      toggleSeat,
      initSession,
      cinemaId,
    ]
  );

  // Precio final de un asiento para una categoría de audiencia dada.
  const priceFor = useCallback(
    (seat, audienceCategoryId) => {
      const matrix = cart.pricingMatrix ?? [];
      const entry =
        matrix.find(
          (p) =>
            p.audience_category?.id === audienceCategoryId &&
            (!seat.category?.id || p.seat_category?.id === seat.category?.id)
        ) ||
        matrix.find((p) => p.audience_category?.id === audienceCategoryId);
      return Number(entry?.final_price ?? 0);
    },
    [cart.pricingMatrix]
  );

  const handleContinue = () => {
    if (cart.tickets.length !== maxSeats) {
      Alert.alert(
        'Selección incompleta',
        `Selecciona ${maxSeats} asiento${maxSeats === 1 ? '' : 's'} para continuar.`
      );
      return;
    }

    // Se asigna a cada asiento (en orden de selección) el tipo de boleto del plan
    const enriched = cart.tickets.map((seat, i) => {
      const audienceCategoryId = ticketPlan[i] ?? ticketPlan[ticketPlan.length - 1] ?? 1;
      return {
        ...seat,
        audienceCategoryId,
        price: priceFor(seat, audienceCategoryId),
      };
    });
    updateTickets(enriched);

    advancingRef.current = true;
    router.push({
      pathname: '/(buy)/concessions',
      params: { showtimeId, movieId, cinemaId },
    });
  };

  if (loading) {
    return (
      <LinearGradient colors={[COLORS.bgDeep, COLORS.bgDarker]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Cargando asientos...</Text>
      </LinearGradient>
    );
  }

  if (error || !movie || !showtime || seatsData.length === 0) {
    return (
      <LinearGradient colors={[COLORS.bgDeep, COLORS.bgDarker]} style={styles.loadingContainer}>
        <Text style={styles.errorText}>
          {error || 'No hay asientos disponibles o la función no existe'}
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const selectedSeatNames = cart.tickets
    .map((t) => `${t.row}${t.column}`)
    .join(', ');

  const displaySeats = seatsData.map((seat) => {
    const override = liveSeatStatus[seat.id];
    if (!override) return seat;
    const isMine = cart.tickets.some((t) => t.seatId === seat.id);
    if (isMine) return seat;
    return { ...seat, status: override };
  });

  return (
    <SafeAreaView style={styles.fullScreen}>
      <LinearGradient colors={[COLORS.bgDeep, COLORS.bgDarker]} style={StyleSheet.absoluteFill} />

      <ShowtimeHeader movie={movie} showtime={showtime} />

      {/* Contador de progreso: X de N asientos */}
      <View style={styles.progressBanner}>
        <Text style={styles.progressText}>
          {cart.tickets.length} de {maxSeats} asientos
        </Text>
      </View>

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

      {cart.tickets.length > 0 && (
        <View style={styles.bottomActionBar}>
          <Text style={styles.summaryText}>Asientos: {selectedSeatNames}</Text>
          <TouchableOpacity
            style={[
              styles.continueButton,
              cart.tickets.length !== maxSeats && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={lockingSeatId !== null || cart.tickets.length !== maxSeats}
          >
            <Text style={styles.continueButtonText}>
              {cart.tickets.length === maxSeats
                ? 'Continuar a confitería'
                : `Faltan ${maxSeats - cart.tickets.length}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: COLORS.textGray, marginTop: 10, fontSize: 16 },
  progressBanner: { alignItems: 'center', paddingVertical: 6 },
  progressText: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontSize: 14,
  },
  connectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  connectionText: { color: COLORS.textGray, fontSize: 13 },
  errorText: { color: COLORS.textMain, fontSize: 18, textAlign: 'center', marginHorizontal: 20 },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
  },
  backButtonText: { color: COLORS.buttonText, fontWeight: 'bold' },
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
  continueButtonDisabled: { opacity: 0.5 },
  continueButtonText: { color: COLORS.buttonText, fontSize: 16, fontWeight: 'bold' },
});
