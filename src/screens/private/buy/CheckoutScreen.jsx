import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Film } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { storageHelper } from '../../../helper/storage.helper';
import { theme } from '../../../constants';

const { colors, spacing, borderRadius } = theme;

const fmtUsd = (n) => `$${Number(n || 0).toFixed(2)}`;
const fmtVes = (n) =>
  `Bs. ${Number(n || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function LineRow({ label, value, subValue, bold, accent, separator }) {
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
        <View style={styles.lineValueGroup}>
          <AppText
            style={[
              styles.lineValue,
              bold && styles.bold,
              accent && styles.accentText,
            ]}
          >
            {value}
          </AppText>
          {subValue ? (
            <AppText style={styles.lineSubValue}>{subValue}</AppText>
          ) : null}
        </View>
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

// ─── Pantalla principal ───────────────────────────────────────────────────────
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

  // Timer local: comienza en 600 segundos (10 min) al montar la pantalla
  const [timeLeft, setTimeLeft] = useState(600);
  const intervalRef = useRef(null);
  const alertShownRef = useRef(false);

  // Iniciar el timer al montar
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Manejar expiración (solo una vez)
  useEffect(() => {
    if (timeLeft === 0 && !alertShownRef.current) {
      alertShownRef.current = true;
      Alert.alert(
        'Sesión expirada',
        'Tu sesión de compra de 10 minutos ha vencido. Vuelve a intentarlo.',
        [
          {
            text: 'Entendido',
            onPress: () => {
              alertShownRef.current = false;
              router.back();
            },
          },
        ]
      );
    }
  }, [timeLeft, router]);

  const hasTickets = cart.tickets.length > 0;
  const hasConcessions = cart.products.length > 0;
  const hasItems = hasTickets || hasConcessions;
  const movie = cart.movie;
  const showtime = cart.showtime;

  const effectiveCinemaId = cart.cinemaId
    ? Number(cart.cinemaId)
    : paramCinemaId
      ? Number(paramCinemaId)
      : cart.showtime?.room?.cinema?.id || null;

  const displayTotal = serverTotals
    ? fmtVes(serverTotals.total_amount_base_currency)
    : fmtUsd(total);
  const displaySubtotal = serverTotals
    ? fmtVes(serverTotals.subtotal_base_currency)
    : fmtUsd(subtotal);
  const displayIva = serverTotals
    ? fmtVes(
        serverTotals.total_amount_base_currency -
          serverTotals.subtotal_base_currency
      )
    : fmtUsd(iva);

  const handleGoToPayment = useCallback(async () => {
    if (processing) return;
    if (!hasItems) {
      Alert.alert('Carrito vacío', 'Agrega al menos un producto o boleto.');
      return;
    }
    if (!effectiveCinemaId) {
      Alert.alert('Sucursal requerida', 'Selecciona una sucursal.');
      return;
    }

    const token = await storageHelper.getAccessToken();
    if (!token) {
      Alert.alert('Sesión requerida', 'Inicia sesión para continuar.', [
        {
          text: 'Iniciar sesión',
          onPress: () => router.replace('/(auth)/login'),
        },
      ]);
      return;
    }

    setProcessing(true);

    const executeCheckout = async () => {
      try {
        let expiresAt;

        if (isConcessionsMode) {
          // Flujo de SOLO confitería: no se pasó por la selección de asientos,
          // así que aquí abrimos una sesión de compra nueva.
          await cancelSession().catch(() => {});
          const quoteResult = await createQuote(effectiveCinemaId);
          expiresAt = quoteResult.expires_at
            ? new Date(quoteResult.expires_at).getTime()
            : Date.now() + (quoteResult.expires_in || 600) * 1000;
        } else {
          // Flujo de BOLETOS: la quote ya fue creada en la selección de asientos.
          // NO la recreamos: hacerlo cancelaría los bloqueos de asientos.
          const session = await getSessionState().catch(() => null);
          if (!session) {
            Alert.alert(
              'Sesión expirada',
              'Tu sesión de compra venció. Vuelve a seleccionar tus asientos.',
              [
                {
                  text: 'Entendido',
                  onPress: () => router.replace('/(main)/home'),
                },
              ]
            );
            return;
          }
          expiresAt = session.expires_at
            ? new Date(session.expires_at).getTime()
            : Date.now() + (session.expires_in || 600) * 1000;
        }

        // Preparar payloads
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
          throw new Error('Falta el ID de reserva en algunos boletos.');
        }

        const checkoutResult = await processCheckout(
          ticketsPayload,
          concessionsPayload
        );
        setServerTotals(checkoutResult);

        // Navegar a Payment con el timestamp de expiración
        router.push({
          pathname: '/(buy)/payment',
          params: {
            total: checkoutResult.total_amount_base_currency,
            subtotal: checkoutResult.subtotal_base_currency,
            currency: checkoutResult.system_base_currency ?? 2,
            exchange_rates: JSON.stringify(checkoutResult.exchange_rates ?? {}),
            expiresAt: expiresAt.toString(),
          },
        });
      } catch (err) {
        console.error('Error checkout:', {
          url: err?.config?.url,
          status: err?.response?.status,
          message: err?.response?.data?.message,
          code: err?.response?.data?.code,
        });
        // 409 = asiento ya no disponible o lock expirado: la sesión quedó inconsistente
        if (err?.response?.status === 409) {
          Alert.alert(
            'Asientos no disponibles',
            err.response?.data?.message ||
              'Uno o más asientos ya no están disponibles. Vuelve a seleccionarlos.',
            [{ text: 'Entendido', onPress: () => router.back() }]
          );
          return;
        }
        Alert.alert(
          'Error al procesar la orden',
          err.response?.data?.message || err.message || 'Ocurrió un problema.'
        );
      } finally {
        setProcessing(false);
      }
    };

    await executeCheckout();
  }, [
    cart,
    hasItems,
    hasTickets,
    router,
    effectiveCinemaId,
    processing,
    isConcessionsMode,
  ]);

  // "Agregar película": llevamos al usuario a la cartelera de la MISMA sucursal
  // de su confitería, para que película y confitería formen una sola compra.
  // Los productos permanecen en el carrito local hasta el checkout.
  const handleAddMovie = () => {
    if (effectiveCinemaId) {
      router.push({
        pathname: '/(main)/cinemas/[cinemaId]',
        params: { cinemaId: String(effectiveCinemaId) },
      });
    } else {
      // Sin sucursal conocida, lo enviamos a la cartelera general
      router.push('/(main)/home');
    }
  };

  const bottomBarHeight =
    56 + spacing.s12 + spacing.s16 + (insets.bottom || 16);

  const showTimer = timeLeft > 0;
  const timerExpired = timeLeft === 0;

  return (
    <View style={styles.screen}>
      <LinearGradient
        {...theme.colors.gradients.bgColor}
        style={StyleSheet.absoluteFill}
      />

      {/* Timer banner con estilo igual al de Payment */}
      <View
        style={[styles.timerBanner, timerExpired && styles.timerBannerExpired]}
      >
        <AppText style={styles.timerText}>
          {timerExpired
            ? '⛔ Sesión expirada'
            : `⏱ Tiempo restante: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`}
        </AppText>
      </View>

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
            !hasTickets ? (
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
                    value={fmtUsd(t.price)}
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
                value={fmtUsd(p.price * p.quantity)}
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
            <LineRow label="Subtotal" value={displaySubtotal} />
            <LineRow label="I.V.A." value={displayIva} />
            <LineRow
              label="Total a pagar"
              value={displayTotal}
              bold
              accent
              separator
            />
            {!serverTotals && (
              <AppText style={styles.estimateNote}>
                * Precios estimados en USD. El total definitivo en Bs. se
                confirma al procesar el pago.
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
            (!hasItems || processing || timerExpired) && styles.payBtnDisabled,
          ]}
          onPress={handleGoToPayment}
          disabled={!hasItems || processing || timerExpired}
          activeOpacity={0.8}
        >
          {processing ? (
            <ActivityIndicator color={colors.midnight[950]} />
          ) : (
            <AppText style={styles.payBtnText}>
              {timerExpired
                ? 'Sesión expirada'
                : hasItems
                  ? `Ir al pago  ·  ${displayTotal}`
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
    paddingTop: spacing.s16,
    gap: spacing.s24,
  },
  // Timer con estilo tipo tarjeta (igual que en Payment)
  timerBanner: {
    backgroundColor: colors.midnight[800],
    paddingVertical: spacing.s8,
    paddingHorizontal: spacing.s16,
    borderRadius: borderRadius.s8,
    marginHorizontal: spacing.s16,
    marginTop: spacing.s8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  timerBannerExpired: { backgroundColor: '#7B1A22' },
  timerText: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 13,
    letterSpacing: 0.5,
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
  lineValueGroup: { alignItems: 'flex-end' },
  lineValue: { color: colors.textSecondary, fontSize: 13 },
  lineSubValue: { color: colors.textSecondary, fontSize: 11, opacity: 0.7 },
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
});
