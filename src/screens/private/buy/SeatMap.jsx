import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ticket } from 'lucide-react-native';
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
import { AppText } from '../../../components/AppText';
import { useCart } from '../../../context/CartContext';
import { getShowtimeSeats } from '../../../services/showtimes.service';
import { theme } from '../../../constants';

const { colors, spacing, borderRadius } = theme;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtPrice = (n, symbol = '$') => `${symbol}${Number(n || 0).toFixed(2)}`;

// ─── Sub-componentes ──────────────────────────────────────────────────────────

/**
 * Tarjeta de un asiento seleccionado, con selector de categoría de audiencia.
 * El usuario elige aquí si ese asiento es para General, Niño, Tercera Edad, etc.
 */
function SeatCategoryCard({
  seat,
  pricingMatrix,
  selectedCategory,
  onSelectCategory,
}) {
  // Obtiene una lista de precios única por categoría de audiencia para este asiento.
  // El matrix viene como producto seat_category × audience_category; si el asiento
  // tiene una seat_category conocida la usamos para filtrar, y de todas formas
  // deduplicamos por audience_category para no mostrar opciones repetidas.
  const seatPrices = useMemo(() => {
    if (!pricingMatrix?.length) return [];

    // 1. Si el asiento tiene categoría, intentamos filtrar por ella
    let filtered = pricingMatrix;
    if (seat.category?.id) {
      const matched = pricingMatrix.filter(
        (p) => p.seat_category?.id === seat.category?.id
      );
      if (matched.length) filtered = matched;
    }

    // 2. Deduplicamos por audience_category (nos quedamos con la primera ocurrencia)
    const byAudience = new Map();
    for (const item of filtered) {
      const audId = item.audience_category?.id;
      if (audId != null && !byAudience.has(audId)) {
        byAudience.set(audId, item);
      }
    }
    return Array.from(byAudience.values());
  }, [pricingMatrix, seat.category?.id]);

  const selectedPrice = seatPrices.find(
    (p) => p.audience_category?.id === selectedCategory?.id
  );

  return (
    <View style={styles.seatCard}>
      {/* Encabezado del asiento */}
      <View style={styles.seatCardHeader}>
        <View style={styles.seatBadge}>
          <AppText style={styles.seatBadgeText}>
            {seat.label || `${seat.row}${seat.column}`}
          </AppText>
        </View>
        <View style={styles.seatMeta}>
          {seat.category?.description ? (
            <AppText style={styles.seatCategoryTag}>
              {seat.category.description}
            </AppText>
          ) : null}
          {selectedPrice ? (
            <AppText style={styles.seatPrice}>
              {fmtPrice(selectedPrice.final_price)}
            </AppText>
          ) : (
            <AppText style={styles.seatPricePlaceholder}>—</AppText>
          )}
        </View>
      </View>

      {/* Selector de categoría de audiencia */}
      {seatPrices.length > 0 ? (
        <View style={styles.categoryRow}>
          {seatPrices.map((item) => {
            const isActive =
              selectedCategory?.id === item.audience_category?.id;
            return (
              <TouchableOpacity
                key={item.audience_category?.id}
                style={[
                  styles.categoryChip,
                  isActive && styles.categoryChipActive,
                ]}
                onPress={() =>
                  onSelectCategory(
                    seat.seatId ?? seat.id,
                    item.audience_category,
                    item.final_price
                  )
                }
                activeOpacity={0.75}
              >
                <AppText
                  style={[
                    styles.categoryChipLabel,
                    isActive && styles.categoryChipLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {item.audience_category?.name}
                </AppText>
                <AppText
                  style={[
                    styles.categoryChipPrice,
                    isActive && styles.categoryChipPriceActive,
                  ]}
                >
                  {fmtPrice(item.final_price)}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        // Fallback: sin pricing matrix (no hay quote activa), mostramos precio base del carrito
        <AppText style={styles.noPricingNote}>
          El precio se confirmará al procesar la orden.
        </AppText>
      )}
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function TicketsSelectionCategory() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showtimeId, movieId, cinemaId } = useLocalSearchParams();

  // Del carrito obtenemos los asientos ya seleccionados en la pantalla anterior
  const { cart, updateTickets } = useCart();
  const selectedSeats = cart.tickets ?? [];

  const [pricingMatrix, setPricingMatrix] = useState(cart.pricingMatrix ?? []);
  const [loadingPricing, setLoadingPricing] = useState(
    !cart.pricingMatrix?.length
  );

  // Mapa local: seatId → { audienceCategory, price }
  const [categoryMap, setCategoryMap] = useState({});

  // ─── Obtener el pricing matrix ───────────────────────────────────────────
  // Preferimos el matrix capturado en la selección de asientos (carrito).
  // Solo si no existe, lo pedimos al seat-map como respaldo.
  useEffect(() => {
    if (cart.pricingMatrix?.length) {
      setPricingMatrix(cart.pricingMatrix);
      setLoadingPricing(false);
      return;
    }
    if (!showtimeId) {
      setLoadingPricing(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const seatData = await getShowtimeSeats(showtimeId);
        const matrix =
          seatData?.pricing?.pricing_matrix ?? seatData?.pricing?.matrix ?? [];
        if (!cancelled) setPricingMatrix(matrix);
      } catch (err) {
        console.warn(
          '[TicketsSelection] No se pudo obtener pricing matrix:',
          err?.message
        );
      } finally {
        if (!cancelled) setLoadingPricing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showtimeId, cart.pricingMatrix]);

  // ─── Inicializar categoryMap con la primera categoría disponible ──────────
  useEffect(() => {
    if (!pricingMatrix.length || !selectedSeats.length) return;
    setCategoryMap((prev) => {
      const next = { ...prev };
      for (const seat of selectedSeats) {
        if (next[seat.seatId]) continue; // ya tiene categoría asignada
        // Buscar la primera entrada del matrix para este asiento
        const firstEntry = pricingMatrix.find(
          (p) => !seat.category?.id || p.seat_category?.id === seat.category?.id
        );
        if (firstEntry) {
          next[seat.seatId] = {
            audienceCategory: firstEntry.audience_category,
            price: firstEntry.final_price,
          };
        }
      }
      return next;
    });
  }, [pricingMatrix, selectedSeats]);

  const handleSelectCategory = useCallback(
    (seatId, audienceCategory, price) => {
      setCategoryMap((prev) => ({
        ...prev,
        [seatId]: { audienceCategory, price },
      }));
    },
    []
  );

  // ─── Validación y continuación ────────────────────────────────────────────
  const allSeatsAssigned = useMemo(() => {
    if (!selectedSeats.length) return false;
    // Si no hay pricing matrix, permitimos continuar (sin categoría)
    if (!pricingMatrix.length) return true;
    return selectedSeats.every((s) => !!categoryMap[s.seatId]);
  }, [selectedSeats, categoryMap, pricingMatrix]);

  const handleContinue = useCallback(() => {
    if (!selectedSeats.length) {
      Alert.alert(
        'Sin asientos',
        'Vuelve atrás y selecciona al menos un asiento.'
      );
      return;
    }

    // Enriquecer cada ticket del carrito con su categoría de audiencia y precio final
    const enrichedTickets = selectedSeats.map((seat) => {
      const assignment = categoryMap[seat.seatId];
      return {
        ...seat,
        audienceCategoryId: assignment?.audienceCategory?.id ?? 1,
        audienceCategoryName: assignment?.audienceCategory?.name ?? 'General',
        price: assignment?.price ?? seat.price ?? 0,
      };
    });

    // Actualizar el carrito con los tickets enriquecidos
    updateTickets(enrichedTickets);

    router.push({
      pathname: '/(buy)/concessions',
      params: { showtimeId, movieId, cinemaId },
    });
  }, [
    selectedSeats,
    categoryMap,
    updateTickets,
    router,
    showtimeId,
    movieId,
    cinemaId,
  ]);

  // ─── Totales ──────────────────────────────────────────────────────────────
  const estimatedTotal = useMemo(() => {
    return selectedSeats.reduce((acc, seat) => {
      const assignment = categoryMap[seat.seatId];
      return acc + (assignment?.price ?? seat.price ?? 0);
    }, 0);
  }, [selectedSeats, categoryMap]);

  const bottomBarHeight = 56 + spacing.s12 + (insets.bottom || spacing.s16);

  // ─── UI ───────────────────────────────────────────────────────────────────
  if (!selectedSeats.length) {
    return (
      <View style={styles.screen}>
        <LinearGradient
          {...theme.colors.gradients.bgColor}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.emptyBox}>
          <Ticket size={48} color={colors.textSecondary} />
          <AppText style={styles.emptyText}>
            No hay asientos seleccionados.
          </AppText>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <AppText style={styles.backBtnText}>Volver</AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <LinearGradient
        {...theme.colors.gradients.bgColor}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: bottomBarHeight + spacing.s16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AppText style={styles.sectionLabel}>TIPO DE ENTRADA</AppText>
        <AppText style={styles.sectionSub}>
          Selecciona la categoría para cada asiento
        </AppText>

        {loadingPricing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
            <AppText style={styles.loadingText}>Cargando precios...</AppText>
          </View>
        ) : (
          selectedSeats.map((seat) => (
            <SeatCategoryCard
              key={seat.seatId}
              seat={seat}
              pricingMatrix={pricingMatrix}
              selectedCategory={
                categoryMap[seat.seatId]?.audienceCategory ?? null
              }
              onSelectCategory={handleSelectCategory}
            />
          ))
        )}

        {/* Resumen de totales */}
        {!loadingPricing && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <AppText style={styles.summaryLabel}>
                Boletos ({selectedSeats.length})
              </AppText>
              <AppText style={styles.summaryValue}>
                {fmtPrice(estimatedTotal)}
              </AppText>
            </View>
            {pricingMatrix.length === 0 && (
              <AppText style={styles.summaryNote}>
                * Precio estimado. El total en Bs. se confirma al procesar la
                orden.
              </AppText>
            )}
          </View>
        )}
      </ScrollView>

      {/* Botón inferior */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom || spacing.s16 },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.continueBtn,
            (!allSeatsAssigned || loadingPricing) && styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={!allSeatsAssigned || loadingPricing}
          activeOpacity={0.85}
        >
          <AppText style={styles.continueBtnText}>
            Continuar a confitería · {fmtPrice(estimatedTotal)}
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1 },

  scroll: {
    paddingHorizontal: spacing.s16,
    paddingTop: spacing.s16,
    gap: spacing.s12,
  },

  sectionLabel: {
    color: colors.textSecondary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  sectionSub: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.s4,
  },

  // ── Loading ──
  loadingBox: {
    paddingVertical: spacing.s32,
    alignItems: 'center',
    gap: spacing.s12,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  // ── Tarjeta de asiento ──
  seatCard: {
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    padding: spacing.s16,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    gap: spacing.s12,
  },
  seatCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s12,
  },
  seatBadge: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.s8,
    backgroundColor: colors.midnight[900],
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  seatBadgeText: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 14,
  },
  seatMeta: {
    flex: 1,
    gap: spacing.s4,
  },
  seatCategoryTag: {
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 0.4,
    fontFamily: theme.typography.family.primary.bold,
  },
  seatPrice: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 18,
  },
  seatPricePlaceholder: {
    color: colors.textSecondary,
    fontSize: 16,
  },

  // ── Chips de categoría ──
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s8,
  },
  categoryChip: {
    flex: 1,
    minWidth: 90,
    backgroundColor: colors.midnight[900],
    borderRadius: borderRadius.s8,
    borderWidth: 1.5,
    borderColor: colors.midnight[600],
    paddingVertical: spacing.s8,
    paddingHorizontal: spacing.s12,
    alignItems: 'center',
    gap: spacing.s4,
  },
  categoryChipActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}18`,
  },
  categoryChipLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: theme.typography.family.primary.bold,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  categoryChipLabelActive: {
    color: colors.primary,
  },
  categoryChipPrice: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: theme.typography.family.primary.regular,
  },
  categoryChipPriceActive: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
  },
  noPricingNote: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },

  // ── Resumen ──
  summaryCard: {
    backgroundColor: colors.midnight[900],
    borderRadius: borderRadius.s16,
    padding: spacing.s16,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    marginTop: spacing.s4,
    gap: spacing.s8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  summaryValue: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 18,
  },
  summaryNote: {
    color: colors.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
  },

  // ── Vacío ──
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s16,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  backBtn: {
    paddingHorizontal: spacing.s24,
    paddingVertical: spacing.s12,
    borderRadius: borderRadius.s8,
    borderWidth: 1.5,
    borderColor: colors.midnight[600],
  },
  backBtnText: {
    color: colors.textSecondary,
    fontFamily: theme.typography.family.primary.bold,
  },

  // ── Botón inferior ──
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
});
