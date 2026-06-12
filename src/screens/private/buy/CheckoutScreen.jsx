import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Film } from 'lucide-react-native';
import { useCallback, useState } from 'react';
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
import { createQuote, processCheckout } from '../../../services/orders.service';
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

// ─── Sub-componentes ──────────────────────────────────────────────────────────
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

// ─── Pantalla ─────────────────────────────────────────────────────────────────
export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // mode='concessions' → viene del catálogo público (sin película obligatoria)
  // mode='buy' (default) → viene del flujo de asientos
  const {
    showtimeId,
    movieId,
    cinemaId,
    mode = 'buy',
  } = useLocalSearchParams();
  const isConcessionsMode = mode === 'concessions';

  const { cart, subtotal, iva, total } = useCart();

  // Los totales del servidor se calculan SOLO al presionar "Ir al pago"
  const [serverTotals, setServerTotals] = useState(null);
  const [processing, setProcessing] = useState(false);

  const hasTickets = cart.tickets.length > 0;
  const hasConcessions = cart.products.length > 0;
  const hasItems = hasTickets || hasConcessions;

  const movie = cart.movie;
  const showtime = cart.showtime;

  // ─── Totales a mostrar: servidor si ya calculó, local como estimado ───────
  const displayTotal = serverTotals?.total_amount_base_currency ?? total;
  const displaySubtotal = serverTotals?.subtotal_base_currency ?? subtotal;
  const displayIva = serverTotals
    ? serverTotals.total_amount_base_currency -
      serverTotals.subtotal_base_currency
    : iva;

  // ─── "Ir al pago": aquí sí llama a la API ────────────────────────────────
  const handleGoToPayment = useCallback(async () => {
    if (!hasItems) {
      Alert.alert(
        'Carrito vacío',
        'Agrega al menos un producto o boleto para continuar.'
      );
      return;
    }

    setProcessing(true);
    try {
      // Quote requiere cinemaId. En modo confitería puede no tenerlo aún;
      // si falta, omitimos createQuote y el backend asigna el cine por defecto.
      const cid = cinemaId ? Number(cinemaId) : null;
      if (cid) await createQuote(cid);

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
      console.error('Error en checkout:', err);
      Alert.alert(
        'Error al procesar la orden',
        err?.response?.data?.message ||
          'Ocurrió un problema. Por favor intenta de nuevo.'
      );
    } finally {
      setProcessing(false);
    }
  }, [cart, cinemaId, hasItems, router]);

  const handleAddMovie = () => router.push('/(main)/home');

  const bottomBarHeight =
    56 + spacing.s12 + spacing.s16 + (insets.bottom || 16);

  return (
    <View style={styles.screen}>
      <LinearGradient
        {...theme.colors.gradients.bgColor}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomBarHeight + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Película / función ── */}
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

        {/* ── Confitería ── */}
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

        {/* ── Carrito vacío ── */}
        {!hasItems && (
          <View style={styles.emptyBox}>
            <AppText style={styles.emptyEmoji}>🛒</AppText>
            <AppText style={styles.emptyText}>Tu carrito está vacío</AppText>
          </View>
        )}

        {/* ── Totales ── */}
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
            {/* Nota: los totales son una estimación hasta confirmar el pago */}
            {!serverTotals && (
              <AppText style={styles.estimateNote}>
                * Precios estimados. El total definitivo se confirma al procesar
                el pago.
              </AppText>
            )}
          </SectionCard>
        )}
      </ScrollView>

      {/* ── Barra inferior ── */}
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
    paddingBottom: spacing.s120,
    gap: spacing.s24,
  },

  // Cards
  card: {
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    padding: spacing.s16,
    gap: spacing.s11,
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.s2,
  },
  cardTitle: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 14,
    letterSpacing: 0.5,
  },

  // Botón agregar película
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

  // Película
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

  // Estado vacío película
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

  // Filas de resumen
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

  // Carrito vacío
  emptyBox: {
    paddingTop: spacing.s48,
    alignItems: 'center',
    gap: spacing.s12,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },

  // Barra inferior
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
