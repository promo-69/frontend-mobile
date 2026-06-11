import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../../../components/AppText';
import { useCart } from '../../../context/CartContext';
import { createQuote, processCheckout } from '../../../services/orders.service';
import { theme } from '../../../constants';

const { colors, spacing, borderRadius } = theme;

// ─── Helpers de formato ─────────────────────────────────────────────────────────
const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

const formatDate = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('es-VE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// ─── Sub-componente: fila de línea ───────────────────────────────────────────────
function LineRow({ label, value, bold, accent, separator }) {
  return (
    <>
      {separator && <View style={styles.separator} />}
      <View style={styles.lineRow}>
        <AppText
          variant={bold ? 'smallText' : 'caption'}
          style={[
            styles.lineLabel,
            bold && styles.bold,
            accent && styles.accentText,
          ]}
        >
          {label}
        </AppText>
        <AppText
          variant={bold ? 'smallText' : 'caption'}
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

// ─── Sub-componente: card de sección ─────────────────────────────────────────────
function SectionCard({ title, children }) {
  return (
    <View style={styles.card}>
      <AppText variant="smallText" style={styles.cardTitle}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { showtimeId, movieId, cinemaId } = useLocalSearchParams();
  const {
    cart,
    tickets: cartTickets,
    productTotal,
    ticketTotal,
    subtotal,
    iva,
    total,
  } = useCart();

  // totales definitivos provenientes del backend (reemplazan los locales)
  const [serverTotals, setServerTotals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Guardamos el orderId para pasarlo a la pantalla de pago
  const orderIdRef = useRef(null);

  // ─── PASO 1 y 2: quote → checkout al montar ────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function initOrder() {
      setLoading(true);
      try {
        // PASO 1: abrir sesión en Redis
        await createQuote(Number(cinemaId));

        // Construir payload para el backend ─────────────────────────────────
        const ticketsPayload = cart.tickets.map((t) => ({
          seatId: t.seatId,
          booking: t.booking,
          audienceCategoryId: t.audienceCategoryId || 1, // default: adulto
        }));

        const concessionsPayload = cart.products.map((p) => ({
          line_type: p.line_type, // 1=producto, 2=combo
          product: p.productId ?? null,
          combo: p.comboId ?? null,
          quantity: p.quantity,
        }));

        // PASO 2: obtener totales reales del backend
        const result = await processCheckout(
          ticketsPayload,
          concessionsPayload
        );

        if (!cancelled) {
          setServerTotals(result);
          orderIdRef.current = result.order_id || null;
        }
      } catch (err) {
        console.error('Error en checkout:', err);
        if (!cancelled) {
          Alert.alert(
            'Error al procesar la orden',
            err?.response?.data?.message ||
              'Ocurrió un problema. Por favor intenta de nuevo.',
            [{ text: 'Volver', onPress: () => router.back() }]
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    initOrder();
    return () => {
      cancelled = true;
    };
  }, []); // solo al montar

  // ─── Navegar a la pantalla de pago ────────────────────────────────────────────
  const handleGoToPayment = useCallback(() => {
    if (!serverTotals) return;
    router.push({
      pathname: '/(buy)/payment',
      params: {
        total: serverTotals.total_amount_base_currency,
        subtotal: serverTotals.subtotal_base_currency,
      },
    });
  }, [router, serverTotals]);

  // ─── Render: loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <LinearGradient
        {...theme.colors.gradients.bgColor}
        style={styles.centered}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="body" style={styles.loadingText}>
          Calculando tu orden...
        </AppText>
      </LinearGradient>
    );
  }

  const displayTotal = serverTotals?.total_amount_base_currency ?? total;
  const displaySubtotal = serverTotals?.subtotal_base_currency ?? subtotal;
  // IVA = diferencia entre total y subtotal del servidor, o cálculo local como fallback
  const displayIva = serverTotals
    ? serverTotals.total_amount_base_currency -
      serverTotals.subtotal_base_currency
    : iva;

  const movie = cart.movie;
  const showtime = cart.showtime;
  const selectedSeats = cart.tickets
    .map((t) => `${t.row || ''}${t.column || t.seatId}`)
    .join(', ');

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <LinearGradient
        {...theme.colors.gradients.bgColor}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Película y función ── */}
        <SectionCard title="Película y función">
          <AppText variant="subtitle" style={styles.movieTitle}>
            {movie?.title || 'Película'}
          </AppText>
          {showtime && (
            <AppText variant="caption" style={styles.showtimeText}>
              {formatDate(showtime.start_time)}
              {showtime.room?.name ? `  •  ${showtime.room.name}` : ''}
            </AppText>
          )}

          {/* Boletos */}
          {cart.tickets.length > 0 && (
            <View style={styles.subsection}>
              <AppText variant="label" style={styles.subsectionTitle}>
                Boletos
              </AppText>
              {cart.tickets.map((t, i) => (
                <LineRow
                  key={t.seatId || i}
                  label={`Asiento ${t.row || ''}${t.column || t.seatId}`}
                  value={fmt(t.price)}
                />
              ))}
            </View>
          )}
        </SectionCard>

        {/* ── Confitería ── */}
        {cart.products.length > 0 && (
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

        {/* ── Resumen de totales ── */}
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
        </SectionCard>
      </ScrollView>

      {/* ── Botón fijo inferior ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.payBtn, submitting && styles.payBtnDisabled]}
          onPress={handleGoToPayment}
          disabled={submitting || !serverTotals}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color={colors.midnight[950]} />
          ) : (
            <AppText variant="button" style={styles.payBtnText}>
              Ir al pago · {fmt(displayTotal)}
            </AppText>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: colors.textSecondary, marginTop: spacing.s12 },

  scrollContent: {
    paddingHorizontal: spacing.s16,
    paddingTop: spacing.s24,
    paddingBottom: spacing.s80,
    gap: spacing.s16,
  },

  // ── Cards ──
  card: {
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    padding: spacing.s16,
    gap: spacing.s8,
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  cardTitle: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
    letterSpacing: 0.5,
    marginBottom: spacing.s4,
  },

  // ── Movie ──
  movieTitle: {
    color: colors.textPrimary,
    fontFamily: theme.typography.family.primary.bold,
  },
  showtimeText: {
    color: colors.textSecondary,
    marginBottom: spacing.s4,
  },

  // ── Sub-secciones ──
  subsection: {
    marginTop: spacing.s8,
    gap: spacing.s4,
  },
  subsectionTitle: {
    color: colors.textSecondary,
    marginBottom: spacing.s4,
  },

  // ── Filas ──
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s4,
  },
  lineLabel: { color: colors.textSecondary, flex: 1 },
  lineValue: { color: colors.textSecondary },
  bold: {
    color: colors.textPrimary,
    fontFamily: theme.typography.family.primary.bold,
  },
  accentText: { color: colors.primary },
  separator: {
    height: 1,
    backgroundColor: colors.midnight[700],
    marginVertical: spacing.s8,
  },

  // ── Barra inferior ──
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(35, 22, 64, 0.97)',
    paddingHorizontal: spacing.s16,
    paddingTop: spacing.s12,
    paddingBottom: spacing.s24,
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
  payBtnDisabled: { opacity: 0.5 },
  payBtnText: { color: colors.midnight[950] },
});
