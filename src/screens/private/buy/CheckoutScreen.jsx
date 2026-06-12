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

  // mode='concessions' → flujo desde catálogo público (sin película obligatoria)
  // mode='buy' (default) → flujo desde selección de asientos
  const {
    showtimeId,
    movieId,
    cinemaId,
    mode = 'buy',
  } = useLocalSearchParams();
  const isConcessionsOnly = mode === 'concessions';

  const { cart, subtotal, iva, total } = useCart();

  const [serverTotals, setServerTotals] = useState(null);
  const [loading, setLoading] = useState(true);
  const orderIdRef = useRef(null);

  // ─── Quote + checkout al montar ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function initOrder() {
      setLoading(true);
      try {
        // cinemaId es obligatorio para quote. En flujo concessions-only
        // puede venir como param o podemos omitirlo si el backend lo permite.
        const cid = cinemaId ? Number(cinemaId) : undefined;
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
              'Ocurrió un problema. Intenta de nuevo.',
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
  }, []);

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

  // Navegar a cartelera para agregar una película al pedido de confitería
  const handleAddMovie = () => {
    router.push('/(main)/home');
  };

  if (loading) {
    return (
      <LinearGradient
        {...theme.colors.gradients.bgColor}
        style={styles.centered}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={styles.loadingText}>Calculando tu orden...</AppText>
      </LinearGradient>
    );
  }

  const displayTotal = serverTotals?.total_amount_base_currency ?? total;
  const displaySubtotal = serverTotals?.subtotal_base_currency ?? subtotal;
  const displayIva = serverTotals
    ? serverTotals.total_amount_base_currency -
      serverTotals.subtotal_base_currency
    : iva;

  const movie = cart.movie;
  const showtime = cart.showtime;
  const hasTickets = cart.tickets.length > 0;
  const hasConcessions = cart.products.length > 0;

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
        {/* ── Sección película/función ── */}
        <SectionCard
          title="Película y función"
          action={
            isConcessionsOnly && !hasTickets ? (
              // Botón para agregar película si venimos del flujo de confitería
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
            // Estado vacío de película — solo visible en modo confitería
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

        {/* ── Totales ── */}
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

      {/* Barra inferior */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom || spacing.s16 },
        ]}
      >
        <TouchableOpacity
          style={[styles.payBtn, !serverTotals && styles.payBtnDisabled]}
          onPress={handleGoToPayment}
          disabled={!serverTotals}
          activeOpacity={0.8}
        >
          <AppText style={styles.payBtnText}>
            Ir al pago · {fmt(displayTotal)}
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: {
    color: colors.textSecondary,
    marginTop: spacing.s12,
    fontSize: 14,
  },

  scrollContent: {
    paddingHorizontal: spacing.s16,
    paddingTop: spacing.s16,
    gap: spacing.s12,
  },

  // Cards
  card: {
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    padding: spacing.s16,
    gap: spacing.s8,
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

  // Botón "Agregar película"
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
    borderColor: colors.midnight[700],
    borderStyle: 'dashed',
    paddingHorizontal: spacing.s12,
  },
  emptyMovieText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Filas
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
