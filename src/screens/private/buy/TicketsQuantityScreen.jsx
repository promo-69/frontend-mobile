import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../../components/ui/AppText';
import { theme } from '../../../constants';
import { useCart } from '../../../context/CartContext';
import { usePurchaseSession } from '../../../context/PurchaseSessionContext';
import { getShowtimeSeats } from '../../../services/showtimes.service';

const { colors, spacing, borderRadius } = theme;
const fmtPrice = (n, symbol = '$') => `${symbol}${Number(n || 0).toFixed(2)}`;

export default function TicketsQuantityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showtimeId, movieId, cinemaId } = useLocalSearchParams();
  const { updateCartDetails, clearProducts, cart } = useCart();
  const { initSession, quoteReady, initializing, error } = usePurchaseSession();

  const [pricingMatrix, setPricingMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  // counts: { [audienceCategoryId]: number }
  const [counts, setCounts] = useState({});

  // 1. Abrir la sesión de compra una sola vez (idempotente en el provider).
  useEffect(() => {
    if (cinemaId) initSession(cinemaId);
  }, [cinemaId, initSession]);

  // 2. Si la sesión es de otra sucursal, la confitería previa se descarta
  //    (la sesión de compra es por sucursal).
  useEffect(() => {
    if (
      cart.products.length > 0 &&
      cart.cinemaId &&
      Number(cart.cinemaId) !== Number(cinemaId)
    ) {
      clearProducts();
    }
  }, [cart.products.length, cart.cinemaId, cinemaId, clearProducts]);

  // 3. Traer la matriz de precios para listar las categorías de audiencia.
  useEffect(() => {
    if (!showtimeId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const seatData = await getShowtimeSeats(showtimeId);
        const clean = Array.isArray(seatData) ? seatData[0] : seatData;
        const matrix =
          clean?.pricing?.pricing_matrix ?? clean?.pricing?.matrix ?? [];
        if (!cancelled) {
          setPricingMatrix(matrix);
          // Guardamos el matrix en el carrito para reutilizarlo en asientos.
          updateCartDetails(cart.movie ?? { id: movieId }, cart.showtime ?? { id: showtimeId }, {
            cinemaId: Number(cinemaId),
            pricingMatrix: matrix,
          });
        }
      } catch (e) {
        if (!cancelled) {
          console.warn('[TicketsQuantity] matrix error:', e?.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showtimeId]);

  // Categorías de audiencia únicas + precio representativo (el precio final real
  // depende del asiento y se confirma en el checkout).
  const audienceCategories = useMemo(() => {
    const byId = new Map();
    for (const item of pricingMatrix) {
      const aud = item.audience_category;
      if (!aud?.id) continue;
      const prev = byId.get(aud.id);
      const price = Number(item.final_price ?? 0);
      // Nos quedamos con el precio más bajo como referencia
      if (!prev || price < prev.price) {
        byId.set(aud.id, { id: aud.id, name: aud.name, price });
      }
    }
    return Array.from(byId.values());
  }, [pricingMatrix]);

  const inc = useCallback((id) => {
    setCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }, []);
  const dec = useCallback((id) => {
    setCounts((prev) => {
      const next = Math.max(0, (prev[id] || 0) - 1);
      return { ...prev, [id]: next };
    });
  }, []);

  const totalTickets = useMemo(
    () => Object.values(counts).reduce((a, b) => a + b, 0),
    [counts]
  );

  const estimatedTotal = useMemo(() => {
    return audienceCategories.reduce(
      (acc, cat) => acc + (counts[cat.id] || 0) * cat.price,
      0
    );
  }, [audienceCategories, counts]);

  const handleContinue = useCallback(() => {
    if (totalTickets === 0) {
      Alert.alert('Sin boletos', 'Selecciona al menos un boleto para continuar.');
      return;
    }
    if (!quoteReady) {
      Alert.alert('Un momento', 'Estamos preparando tu sesión de compra.');
      return;
    }
    // plan: un audienceCategoryId por cada boleto solicitado
    const plan = [];
    for (const cat of audienceCategories) {
      const n = counts[cat.id] || 0;
      for (let i = 0; i < n; i++) plan.push(cat.id);
    }

    router.push({
      pathname: '/(buy)/selectSeats',
      params: {
        showtimeId,
        movieId,
        cinemaId,
        plan: JSON.stringify(plan),
      },
    });
  }, [
    totalTickets,
    quoteReady,
    audienceCategories,
    counts,
    router,
    showtimeId,
    movieId,
    cinemaId,
  ]);

  const busy = loading || initializing;

  if (error) {
    return (
      <LinearGradient
        colors={[colors.midnight[900], colors.midnight[800]]}
        style={styles.center}
      >
        <AppText style={styles.errorText}>{error}</AppText>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppText style={styles.backBtnText}>Volver</AppText>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.midnight[900], colors.midnight[800]]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
      >
        <AppText style={styles.sectionLabel}>¿CUÁNTOS BOLETOS?</AppText>
        <AppText style={styles.sectionSub}>
          Elige el tipo y la cantidad. Los asientos los eliges en el siguiente
          paso.
        </AppText>

        {busy ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText style={styles.loadingText}>
              {initializing ? 'Preparando tu compra...' : 'Cargando precios...'}
            </AppText>
          </View>
        ) : audienceCategories.length === 0 ? (
          <AppText style={styles.noPricingNote}>
            No hay tarifas configuradas para esta función.
          </AppText>
        ) : (
          audienceCategories.map((cat) => (
            <View key={cat.id} style={styles.row}>
              <View style={styles.rowInfo}>
                <AppText style={styles.rowName}>{cat.name}</AppText>
                <AppText style={styles.rowPrice}>
                  {fmtPrice(cat.price)} c/u aprox.
                </AppText>
              </View>
              <View style={styles.counter}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => dec(cat.id)}
                  disabled={(counts[cat.id] || 0) === 0}
                >
                  <AppText style={styles.counterBtnText}>−</AppText>
                </TouchableOpacity>
                <AppText style={styles.counterValue}>
                  {counts[cat.id] || 0}
                </AppText>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => inc(cat.id)}
                >
                  <AppText style={styles.counterBtnText}>+</AppText>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {!busy && audienceCategories.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <AppText style={styles.summaryLabel}>
                Boletos ({totalTickets})
              </AppText>
              <AppText style={styles.summaryValue}>
                {fmtPrice(estimatedTotal)}
              </AppText>
            </View>
            <AppText style={styles.summaryNote}>
              * Precio estimado. El total en Bs. se confirma al procesar la
              orden.
            </AppText>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || spacing.s16 }]}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            (totalTickets === 0 || busy || !quoteReady) &&
              styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={totalTickets === 0 || busy || !quoteReady}
          activeOpacity={0.85}
        >
          <AppText style={styles.continueBtnText}>
            {quoteReady
              ? `Continuar a asientos · ${fmtPrice(estimatedTotal)}`
              : 'Preparando sesión...'}
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.s16 },
  scroll: { paddingHorizontal: spacing.s16, paddingTop: spacing.s16, gap: spacing.s12 },
  sectionLabel: {
    color: colors.textSecondary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  sectionSub: { color: colors.textSecondary, fontSize: 13, marginBottom: spacing.s8 },
  loadingBox: { paddingVertical: spacing.s32, alignItems: 'center', gap: spacing.s12 },
  loadingText: { color: colors.textSecondary, fontSize: 14 },
  row: {
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    padding: spacing.s16,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowInfo: { gap: spacing.s4 },
  rowName: {
    color: colors.textPrimary ?? '#fff',
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 16,
  },
  rowPrice: { color: colors.textSecondary, fontSize: 13 },
  counter: { flexDirection: 'row', alignItems: 'center', gap: spacing.s16 },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.midnight[900],
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    color: colors.primary,
    fontSize: 20,
    fontFamily: theme.typography.family.primary.bold,
    lineHeight: 22,
  },
  counterValue: {
    color: colors.textPrimary ?? '#fff',
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 18,
    minWidth: 24,
    textAlign: 'center',
  },
  noPricingNote: { color: colors.textSecondary, fontSize: 12, fontStyle: 'italic' },
  summaryCard: {
    backgroundColor: colors.midnight[900],
    borderRadius: borderRadius.s16,
    padding: spacing.s16,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    marginTop: spacing.s4,
    gap: spacing.s8,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: colors.textSecondary, fontSize: 14 },
  summaryValue: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 18,
  },
  summaryNote: { color: colors.textSecondary, fontSize: 11, fontStyle: 'italic' },
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
  continueBtn: {
    width: '100%',
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.s8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: {
    color: colors.midnight[950],
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 15,
  },
  errorText: { color: '#fff', fontSize: 16, textAlign: 'center', marginHorizontal: 24 },
  backBtn: {
    paddingHorizontal: spacing.s24,
    paddingVertical: spacing.s12,
    borderRadius: borderRadius.s8,
    borderWidth: 1.5,
    borderColor: colors.midnight[600],
  },
  backBtnText: { color: colors.textSecondary, fontFamily: theme.typography.family.primary.bold },
});
