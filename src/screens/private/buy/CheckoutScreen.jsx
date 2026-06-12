import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Film } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../../components/AppText';
import { useCart } from '../../../context/CartContext';
import {
  createQuote,
  processCheckout,
  cancelSession,
  getSessionState,
} from '../../../services/orders.service';
import { getCinemas } from '../../../services/cinemas.service';
import { storageHelper } from '../../../helper/storage.helper';
import { theme } from '../../../constants';

const { colors, spacing, borderRadius } = theme;

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-VE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

function LineRow({ label, value, bold, accent, separator }) {
  return (
    <>
      {separator && <View style={styles.separator} />}
      <View style={styles.lineRow}>
        <AppText
          style={[
            styles.lineLabel,
            bold && styles.bold,
            accent && styles.accentText,
          ]}
        >
          {label}
        </AppText>
        <AppText
          style={[
            styles.lineValue,
            bold && styles.bold,
            accent && styles.accentText,
          ]}
        >
          {value}
        </AppText>
      </View>
    </>
  );
}

function SectionCard({ title, children, action }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <AppText style={styles.cardTitle}>{title}</AppText>
        {action}
      </View>
      {children}
    </View>
  );
}

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    showtimeId,
    movieId,
    cinemaId: paramCinemaId,
    mode = 'buy',
  } = useLocalSearchParams();
  const isConcessionsMode = mode === 'concessions';
  const { cart, subtotal, iva, total } = useCart();

  const [serverTotals, setServerTotals] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cinemas, setCinemas] = useState([]);
  const [loadingCinemas, setLoadingCinemas] = useState(true);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const hasTickets = cart.tickets.length > 0;
  const hasConcessions = cart.products.length > 0;
  const hasItems = hasTickets || hasConcessions;
  const movie = cart.movie;
  const showtime = cart.showtime;

  const displayTotal = serverTotals?.total_amount_base_currency ?? total;
  const displaySubtotal = serverTotals?.subtotal_base_currency ?? subtotal;
  const displayIva = serverTotals
    ? serverTotals.total_amount_base_currency -
      serverTotals.subtotal_base_currency
    : iva;

  // cinemaId final: parámetro de ruta > sala del showtime > null
  const effectiveCinemaId = paramCinemaId
    ? Number(paramCinemaId)
    : cart.showtime?.room?.cinema?.id || null;

  // Cargar cines solo si no tenemos cinemaId todavía
  useEffect(() => {
    if (effectiveCinemaId) {
      setSelectedCinema({ id: effectiveCinemaId });
      setLoadingCinemas(false);
      return;
    }
    if (selectedCinema) return;

    let isMounted = true;
    const fetchCinemas = async () => {
      setLoadingCinemas(true);
      try {
        const data = await getCinemas();
        if (isMounted && data && data.length > 0) {
          setCinemas(data);
          setModalVisible(true);
        } else if (isMounted) {
          Alert.alert('Sin sucursales', 'No hay sucursales disponibles.');
        }
      } catch (error) {
        if (isMounted) {
          Alert.alert(
            'Error de conexión',
            'No se pudo cargar la lista de sucursales.',
            [{ text: 'Reintentar', onPress: fetchCinemas }]
          );
        }
      } finally {
        if (isMounted) setLoadingCinemas(false);
      }
    };
    fetchCinemas();
    return () => {
      isMounted = false;
    };
  }, [effectiveCinemaId, selectedCinema]);

  const handleSelectCinema = (cinema) => {
    setSelectedCinema(cinema);
    setModalVisible(false);
  };

  const handleGoToPayment = useCallback(async () => {
    if (!hasItems) {
      Alert.alert(
        'Carrito vacío',
        'Agrega al menos un producto o boleto para continuar.'
      );
      return;
    }

    const finalCinemaId = selectedCinema?.id;
    if (!finalCinemaId) {
      Alert.alert('Sucursal requerida', 'Por favor selecciona una sucursal.');
      if (!modalVisible && !loadingCinemas) setModalVisible(true);
      return;
    }

    // Verificar que el usuario tenga sesión activa (el back necesita el JWT para leer el customerId)
    const token = await storageHelper.getAccessToken();
    if (!token) {
      Alert.alert(
        'Sesión requerida',
        'Necesitás iniciar sesión para completar la compra.',
        [
          {
            text: 'Iniciar sesión',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
      return;
    }

    setProcessing(true);
    try {
      // Limpiar sesión anterior si existe en Redis
      try {
        await cancelSession();
      } catch (_) {}

      await createQuote(finalCinemaId);

      const ticketsPayload = cart.tickets.map((t) => ({
        seatId: t.seatId,
        booking: t.booking,
        audienceCategoryId: t.audienceCategoryId || 1,
      }));
      const concessionsPayload = cart.products.map((p) => ({
        line_type: p.line_type,
        product: p.productId ?? null,
        combo: p.comboId ?? null,
        quantity: p.quantity,
      }));

      if (hasTickets && ticketsPayload.some((t) => !t.booking)) {
        throw new Error(
          'Falta el ID de reserva en algunos boletos. Reintentá la selección de asientos.'
        );
      }

      const result = await processCheckout(ticketsPayload, concessionsPayload);
      setServerTotals(result);

      router.push({
        pathname: '/(buy)/payment',
        params: {
          total: result.total_amount_base_currency,
          subtotal: result.subtotal_base_currency,
        },
      });
    } catch (err) {
      // TEMPORAL - borrar después de depurar
      console.log('=== ERROR COMPLETO ===');
      console.log('status:', err?.response?.status);
      console.log('data:', JSON.stringify(err?.response?.data, null, 2));
      console.log('message:', err?.message);
      console.log('=== FIN ERROR ===');

      Alert.alert(
        'Error al procesar la orden',
        err.response?.data?.message || err.message || 'Ocurrió un problema.'
      );
    } finally {
      setProcessing(false);
    }
  }, [
    cart,
    hasItems,
    hasTickets,
    router,
    selectedCinema,
    modalVisible,
    loadingCinemas,
  ]);

  const handleAddMovie = () => router.push('/(main)/home');

  const bottomBarHeight =
    56 + spacing.s12 + spacing.s16 + (insets.bottom || 16);

  if (loadingCinemas && !selectedCinema && !effectiveCinemaId) {
    return (
      <View
        style={[styles.centered, { backgroundColor: colors.midnight[950] }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={styles.loadingText}>Cargando sucursales...</AppText>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <LinearGradient
        {...theme.colors.gradients.bgColor}
        style={StyleSheet.absoluteFill}
      />

      {/* Modal selector de sucursal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <AppText style={styles.modalTitle}>Selecciona tu sucursal</AppText>
            <FlatList
              data={cinemas}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cinemaOption}
                  onPress={() => handleSelectCinema(item)}
                >
                  <AppText style={styles.cinemaName}>{item.name}</AppText>
                  <AppText style={styles.cinemaAddress}>{item.address}</AppText>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomBarHeight + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SectionCard
          title="Película y función"
          action={
            isConcessionsMode && !hasTickets ? (
              <TouchableOpacity
                style={styles.addMovieBtn}
                onPress={handleAddMovie}
                activeOpacity={0.8}
              >
                <Film size={14} color={colors.midnight[950]} />
                <AppText style={styles.addMovieBtnText}>
                  Agregar película
                </AppText>
              </TouchableOpacity>
            ) : null
          }
        >
          {hasTickets ? (
            <>
              <AppText style={styles.movieTitle}>
                {movie?.title || 'Película'}
              </AppText>
              {showtime && (
                <AppText style={styles.showtimeText}>
                  {formatDate(showtime.start_time)}
                  {showtime.room?.name ? `  •  ${showtime.room.name}` : ''}
                </AppText>
              )}
              <View style={styles.subsection}>
                <AppText style={styles.subsectionTitle}>Boletos</AppText>
                {cart.tickets.map((t, i) => (
                  <LineRow
                    key={t.seatId || i}
                    label={`Asiento ${t.row || ''}${t.column || t.seatId}`}
                    value={fmt(t.price)}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyMovieBox}>
              <AppText style={styles.emptyMovieText}>
                Sin película seleccionada. Puedes continuar solo con confitería
                o agregar una función.
              </AppText>
            </View>
          )}
        </SectionCard>

        {hasConcessions && (
          <SectionCard title="Confitería">
            {cart.products.map((p, i) => (
              <LineRow
                key={p.productId || p.comboId || i}
                label={`${p.name}  ×${p.quantity}`}
                value={fmt(p.price * p.quantity)}
              />
            ))}
          </SectionCard>
        )}

        {!hasItems && (
          <View style={styles.emptyBox}>
            <AppText style={styles.emptyEmoji}>🛒</AppText>
            <AppText style={styles.emptyText}>Tu carrito está vacío</AppText>
          </View>
        )}

        {hasItems && (
          <SectionCard title="Resumen">
            <LineRow label="Subtotal" value={fmt(displaySubtotal)} />
            <LineRow label="I.V.A." value={fmt(displayIva)} />
            <LineRow
              label="Total a pagar"
              value={fmt(displayTotal)}
              bold
              accent
              separator
            />
            {!serverTotals && (
              <AppText style={styles.estimateNote}>
                * Precios estimados. El total definitivo se confirma al procesar
                el pago.
              </AppText>
            )}
          </SectionCard>
        )}
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom || spacing.s16 },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.payBtn,
            (!hasItems || processing) && styles.payBtnDisabled,
          ]}
          onPress={handleGoToPayment}
          disabled={!hasItems || processing}
          activeOpacity={0.8}
        >
          {processing ? (
            <ActivityIndicator color={colors.midnight[950]} />
          ) : (
            <AppText style={styles.payBtnText}>
              {hasItems
                ? `Ir al pago  ·  ${fmt(displayTotal)}`
                : 'Agrega productos para continuar'}
            </AppText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.s16,
    paddingTop: spacing.s24,
    gap: spacing.s24,
  },
  card: {
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    padding: spacing.s16,
    gap: spacing.s1,
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.s4,
  },
  cardTitle: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  addMovieBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s4,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.s8,
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s4,
  },
  addMovieBtnText: {
    color: colors.midnight[950],
    fontSize: 12,
    fontFamily: theme.typography.family.primary.bold,
  },
  movieTitle: {
    color: colors.textPrimary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 16,
  },
  showtimeText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.s4,
  },
  subsection: { marginTop: spacing.s8, gap: spacing.s4 },
  subsectionTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: theme.typography.family.primary.bold,
    marginBottom: spacing.s4,
  },
  emptyMovieBox: {
    paddingVertical: spacing.s8,
    borderRadius: borderRadius.s8,
    borderWidth: 1,
    borderColor: colors.midnight[600],
    borderStyle: 'dashed',
    paddingHorizontal: spacing.s12,
  },
  emptyMovieText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s4,
  },
  lineLabel: { color: colors.textSecondary, flex: 1, fontSize: 13 },
  lineValue: { color: colors.textSecondary, fontSize: 13 },
  bold: {
    color: colors.textPrimary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 14,
  },
  accentText: { color: colors.primary },
  separator: {
    height: 1,
    backgroundColor: colors.midnight[700],
    marginVertical: spacing.s8,
  },
  estimateNote: {
    color: colors.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: spacing.s4,
  },
  emptyBox: { paddingTop: spacing.s48, alignItems: 'center', gap: spacing.s12 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(35, 22, 64, 0.97)',
    paddingHorizontal: spacing.s16,
    paddingTop: spacing.s12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: colors.midnight[700],
  },
  payBtn: {
    width: '100%',
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.s8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnDisabled: { opacity: 0.4 },
  payBtnText: {
    color: colors.midnight[950],
    fontSize: 15,
    fontFamily: theme.typography.family.primary.bold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: colors.midnight[900],
    borderRadius: borderRadius.s16,
    padding: spacing.s16,
  },
  modalTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.s12,
    textAlign: 'center',
  },
  cinemaOption: {
    paddingVertical: spacing.s12,
    borderBottomWidth: 1,
    borderBottomColor: colors.midnight[700],
  },
  cinemaName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cinemaAddress: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  loadingText: { color: colors.textSecondary, marginTop: spacing.s12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
