import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    SectionList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../../components/ui/AppText';
import { theme } from '../../../constants';
import { useCart } from '../../../context/CartContext';
import { getCinemaById, getCinemas } from '../../../services/cinemas.service';
import {
    getAvailableCombos,
    getAvailableProducts,
} from '../../../services/concessions.service';
import { appAlert } from '../../../context/AlertContext';

const { colors, spacing, borderRadius } = theme;

const LINE_TYPE_PRODUCT = 1;
const LINE_TYPE_COMBO = 2;

// Obtiene el precio del producto/combo: el backend lo entrega en
// pricing.final_price; mantenemos item.price como respaldo.
function getItemPrice(item) {
  if (item?.pricing?.final_price !== undefined)
    return Number(item.pricing.final_price);
  if (item?.price !== undefined) return Number(item.price);
  return 0;
}

// ─── ConcessionItem (inline para evitar problemas de path) ───────────────────
function ConcessionItem({ item, quantity, onAdd, onRemove, isCombo, available = true }) {
  const price = `$${getItemPrice(item).toFixed(2)}`;
  const imageUri = item.image_url || item.imageUrl;

  return (
    <View style={itemStyles.card}>
      {/* Imagen */}
      <View style={itemStyles.imageZone}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={itemStyles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={itemStyles.imageFallback}>
            <AppText style={itemStyles.fallbackEmoji}>
              {isCombo ? '🎁' : '🍿'}
            </AppText>
          </View>
        )}
        {isCombo && (
          <View style={itemStyles.badge}>
            <AppText style={itemStyles.badgeText}>COMBO</AppText>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={itemStyles.infoZone}>
        <AppText style={itemStyles.name} numberOfLines={2}>
          {item.name?.toUpperCase()}
        </AppText>

        <View style={itemStyles.footerRow}>
          <AppText style={itemStyles.price}>{price}</AppText>
          {available ? (
            <View style={itemStyles.counter}>
              <TouchableOpacity
                style={[itemStyles.btn, quantity === 0 && itemStyles.btnDisabled]}
                onPress={onRemove}
                disabled={quantity === 0}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppText
                  style={[
                    itemStyles.btnText,
                    quantity === 0 && itemStyles.btnTextDisabled,
                  ]}
                >
                  −
                </AppText>
              </TouchableOpacity>

              <AppText style={itemStyles.qty}>{quantity}</AppText>

              <TouchableOpacity
                style={itemStyles.btn}
                onPress={onAdd}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppText style={itemStyles.btnText}>+</AppText>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {!available && (
          <View style={itemStyles.unavailablePill}>
            <AppText style={itemStyles.unavailableText}>No disponible</AppText>
          </View>
        )}
      </View>
    </View>
  );
}

const BTN = 28;
const itemStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.midnight[900],
    borderRadius: borderRadius.s16,
    overflow: 'hidden',
  },
  imageZone: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  imageFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.midnight[800],
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackEmoji: { fontSize: 36 },
  badge: {
    position: 'absolute',
    top: spacing.s8,
    left: spacing.s8,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.s4,
    paddingHorizontal: spacing.s8,
    paddingVertical: 3,
  },
  badgeText: {
    color: colors.midnight[950],
    fontSize: 9,
    fontFamily: theme.typography.family.primary.bold,
    letterSpacing: 0.6,
  },
  infoZone: {
    paddingHorizontal: spacing.s8,
    paddingTop: spacing.s8,
    paddingBottom: spacing.s12,
    gap: spacing.s8,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 11,
    fontFamily: theme.typography.family.primary.regular,
    lineHeight: 15,
    minHeight: 30,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: colors.primary,
    fontSize: 15,
    fontFamily: theme.typography.family.primary.bold,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s4,
  },
  btn: {
    width: BTN,
    height: BTN,
    borderRadius: borderRadius.s4,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { backgroundColor: colors.midnight[700] },
  btnText: {
    color: colors.midnight[950],
    fontSize: 17,
    lineHeight: BTN,
    fontFamily: theme.typography.family.primary.bold,
    textAlign: 'center',
  },
  btnTextDisabled: { color: colors.textSecondary },
  qty: {
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: theme.typography.family.primary.bold,
    minWidth: 18,
    textAlign: 'center',
  },
  unavailablePill: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
    borderRadius: borderRadius.s8,
    paddingVertical: spacing.s8,
    alignItems: 'center',
  },
  unavailableText: {
    color: '#f87171',
    fontSize: 11,
    fontFamily: theme.typography.family.primary.bold,
  },
});

// ─── Grid de 2 columnas por sección ──────────────────────────────────────────
function GridSection({ items, lineType, getQuantity, onAdd, onRemove }) {
  const rows = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));

  return (
    <View style={gridStyles.section}>
      {rows.map((row, ri) => (
        <View key={`row-${lineType}-${ri}`} style={gridStyles.row}>
          {row.map((item) => (
            <View key={`${lineType}-${item.id}`} style={gridStyles.cell}>
              <ConcessionItem
                item={item}
                isCombo={lineType === LINE_TYPE_COMBO}
                quantity={getQuantity(item.id, lineType)}
                onAdd={() => onAdd(item, lineType)}
                onRemove={() => onRemove(item, lineType)}
                available={item._available !== false}
              />
            </View>
          ))}
          {row.length === 1 && (
            <View key={`spacer-${lineType}-${ri}`} style={gridStyles.cell} />
          )}
        </View>
      ))}
    </View>
  );
}

const gridStyles = StyleSheet.create({
  section: { marginBottom: spacing.s8 },
  row: {
    flexDirection: 'row',
    gap: spacing.s8,
    marginBottom: spacing.s8,
  },
  cell: { flex: 1 },
});

// ─── Agrupa productos por categoría ──────────────────────────────────────────
function buildSections(combos, products) {
  const sections = [];

  // Mapa producto → stock para evaluar disponibilidad de combos
  const stockMap = new Map();
  for (const p of products) stockMap.set(p.id, p.stock ?? 0);

  // Disponibilidad: si el producto no trae stock, se asume disponible
  const productAvailable = (p) => p.stock === undefined || (p.stock ?? 0) > 0;
  const comboAvailable = (c) => {
    const parts = c._ComboProducts || [];
    if (parts.length === 0) return true;
    return parts.every((cp) => (stockMap.get(cp.product) ?? 0) >= cp.quantity);
  };

  if (combos.length > 0) {
    sections.push({
      title: 'Combos',
      data: combos.map((c) => ({ ...c, _available: comboAvailable(c) })),
      lineType: LINE_TYPE_COMBO,
    });
  }
  const byCategory = {};
  for (const p of products) {
    // El backend expone la categoría como `description` (no `name`)
    const cat =
      p._ProductCategories?.description ||
      p._ProductCategories?.name ||
      p.product_category?.description ||
      p.product_category?.name ||
      'Otros';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push({ ...p, _available: productAvailable(p) });
  }
  for (const [title, data] of Object.entries(byCategory)) {
    sections.push({ title, data, lineType: LINE_TYPE_PRODUCT });
  }
  return sections;
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function ConcessionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    showtimeId,
    movieId,
    cinemaId: paramCinemaId,
  } = useLocalSearchParams();
  const { cart, addProduct, updateProductQuantity, removeProduct } = useCart();

  // El cinemaId fuente de verdad es el del carrito (con el que se creó la quote
  // en la selección de asientos). Solo usamos el param si el carrito no lo tiene.
  const resolvedCinemaId = cart.cinemaId
    ? Number(cart.cinemaId)
    : paramCinemaId
      ? Number(paramCinemaId)
      : null;

  // Flujo de compra: la sucursal viene fija desde la selección de asientos.
  // En este caso NO se permite cambiar de sucursal.
  const isPurchaseFlow = !!resolvedCinemaId;

  // Si ya conocemos la sucursal (flujo de compra), la usamos directo y NO
  // mostramos el selector. Solo se pide elegir sucursal si no hay ninguna.
  const [selectedCinema, setSelectedCinema] = useState(
    resolvedCinemaId ? { id: resolvedCinemaId } : null
  );
  const [cinemas, setCinemas] = useState([]);
  const [cinemaModalVisible, setCinemaModalVisible] = useState(false);
  const [loadingCinemas, setLoadingCinemas] = useState(!resolvedCinemaId);

  const [loading, setLoading] = useState(false);
  const [combos, setCombos] = useState([]);
  const [products, setProducts] = useState([]);

  // Cargar el nombre real de la sucursal cuando viene fija del flujo de compra
  useEffect(() => {
    if (!resolvedCinemaId) return;
    let cancelled = false;
    getCinemaById(resolvedCinemaId)
      .then((data) => {
        const cinema = data?.data ?? data;
        if (!cancelled && cinema?.name) {
          setSelectedCinema((prev) => ({
            ...prev,
            ...cinema,
            id: resolvedCinemaId,
          }));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [resolvedCinemaId]);

  // Paso 1: Si no hay sucursal resuelta, cargar sucursales y mostrar modal.
  useEffect(() => {
    if (resolvedCinemaId) return; // ya tenemos sucursal del flujo de compra

    let isMounted = true;
    const fetchCinemas = async () => {
      setLoadingCinemas(true);
      try {
        const response = await getCinemas();
        const data = Array.isArray(response) ? response : response?.data || [];
        if (isMounted && data && data.length > 0) {
          setCinemas(data);
          setCinemaModalVisible(true);
        } else if (isMounted) {
          appAlert('Sin sucursales', 'No hay sucursales disponibles.');
        }
      } catch {
        if (isMounted) {
          appAlert(
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
  }, [resolvedCinemaId]);

  // Paso 2: Cuando ya hay sucursal (por params o por selección), cargar catálogo.
  useEffect(() => {
    if (!selectedCinema) return;
    let cancelled = false;
    setLoading(true);
    async function load() {
      try {
        const [cRes, pRes] = await Promise.all([
          getAvailableCombos(selectedCinema.id),
          getAvailableProducts(selectedCinema.id),
        ]);
        if (!cancelled) {
          setCombos(cRes || []);
          setProducts(pRes || []);
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err?.response?.data?.message ||
            'No se pudo cargar el catálogo. Verifica tu conexión.';
          appAlert('Error', msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedCinema]);

  const sections = useMemo(
    () => buildSections(combos, products),
    [combos, products]
  );

  const getItemQuantity = useCallback(
    (itemId, lineType) => {
      const key = lineType === LINE_TYPE_COMBO ? 'comboId' : 'productId';
      const found = cart.products.find((p) => p[key] === itemId);
      return found?.quantity || 0;
    },
    [cart.products]
  );

  const handleAdd = useCallback(
    (item, lineType) => {
      const isCombo = lineType === LINE_TYPE_COMBO;
      const key = isCombo ? 'comboId' : 'productId';
      const existing = cart.products.find((p) => p[key] === item.id);
      if (existing) {
        updateProductQuantity(item.id, existing.quantity + 1, isCombo);
      } else {
        addProduct({
          productId: isCombo ? undefined : item.id,
          comboId: isCombo ? item.id : undefined,
          name: item.name,
          price: getItemPrice(item),
          imageUrl: item.image_url || item.imageUrl,
          line_type: lineType,
          quantity: 1,
        });
      }
    },
    [cart.products, addProduct, updateProductQuantity]
  );

  const handleRemove = useCallback(
    (item, lineType) => {
      const isCombo = lineType === LINE_TYPE_COMBO;
      const key = isCombo ? 'comboId' : 'productId';
      const existing = cart.products.find((p) => p[key] === item.id);
      if (!existing) return;
      if (existing.quantity <= 1) removeProduct(item.id, isCombo);
      else updateProductQuantity(item.id, existing.quantity - 1, isCombo);
    },
    [cart.products, removeProduct, updateProductQuantity]
  );

  const { itemCount, concessionTotal } = useMemo(
    () => ({
      itemCount: cart.products.reduce((acc, p) => acc + p.quantity, 0),
      concessionTotal: cart.products.reduce(
        (acc, p) => acc + p.price * p.quantity,
        0
      ),
    }),
    [cart.products]
  );

  const cinemaId = selectedCinema?.id ?? resolvedCinemaId;

  const goToCheckout = () =>
    router.push({
      pathname: '/(buy)/checkout',
      params: { showtimeId, movieId, cinemaId },
    });

  const bottomPad = (insets.bottom || 16) + 56 + spacing.s12 + spacing.s16;

  // Esperando la lista de sucursales
  if (loadingCinemas) {
    return (
      <LinearGradient
        {...theme.colors.gradients.bgColor}
        style={styles.centered}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={styles.loadingText}>Cargando sucursales...</AppText>
      </LinearGradient>
    );
  }

  if (loading) {
    return (
      <LinearGradient
        {...theme.colors.gradients.bgColor}
        style={styles.centered}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={styles.loadingText}>Cargando catálogo...</AppText>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.screen}>
      <LinearGradient
        {...theme.colors.gradients.bgColor}
        style={StyleSheet.absoluteFill}
      />

      {/* Modal selector de sucursal */}
      <Modal visible={cinemaModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <AppText style={styles.modalTitle}>Selecciona tu sucursal</AppText>
            <FlatList
              data={cinemas}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cinemaOption}
                  onPress={() => {
                    setSelectedCinema(item);
                    setCinemaModalVisible(false);
                  }}
                >
                  <AppText style={styles.cinemaName}>{item.name}</AppText>
                  <AppText style={styles.cinemaAddress}>{item.address}</AppText>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {selectedCinema && (
        <TouchableOpacity
          style={styles.selectedCinemaBar}
          onPress={() => {
            if (!isPurchaseFlow) setCinemaModalVisible(true);
          }}
          activeOpacity={isPurchaseFlow ? 1 : 0.8}
          disabled={isPurchaseFlow}
        >
          <AppText style={styles.selectedCinemaText}>
            📍 {selectedCinema.name || `Sucursal #${selectedCinema.id}`}
          </AppText>
          {!isPurchaseFlow && (
            <AppText style={styles.changeCinemaText}>Cambiar</AppText>
          )}
        </TouchableOpacity>
      )}

      <AppText style={styles.subtitle}>
        ¡Selecciona tus productos de confitería para hoy!
      </AppText>

      <SectionList
        sections={sections}
        keyExtractor={(item, i) =>
          `${item.comboId ? 'combo' : 'prod'}-${item.id}-${i}`
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomPad + (itemCount > 0 ? 36 : 0) },
        ]}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section: { title } }) => (
          <AppText style={styles.sectionHeader}>{title.toUpperCase()}</AppText>
        )}
        renderItem={() => null}
        renderSectionFooter={({ section }) => (
          <GridSection
            items={section.data}
            lineType={section.lineType}
            getQuantity={getItemQuantity}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
        )}
      />

      {/* Barra inferior */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom || spacing.s16 },
        ]}
      >
        {itemCount > 0 && (
          <View style={styles.bottomInfo}>
            <AppText style={styles.bottomInfoText}>
              {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'} añadidos
            </AppText>
            <AppText style={styles.bottomPrice}>
              ${concessionTotal.toFixed(2)}
            </AppText>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.continueBtn,
            itemCount === 0 && styles.continueBtnOutline,
          ]}
          onPress={goToCheckout}
          activeOpacity={0.8}
        >
          <AppText
            style={[
              styles.continueBtnText,
              itemCount === 0 && styles.continueBtnTextOutline,
            ]}
          >
            {itemCount > 0
              ? 'Ver resumen del pedido'
              : 'Continuar sin confitería'}
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
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: spacing.s24,
    marginTop: spacing.s16,
    marginBottom: spacing.s8,
    lineHeight: 20,
  },
  listContent: { paddingHorizontal: spacing.s16 },
  sectionHeader: {
    color: colors.textPrimary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 12,
    letterSpacing: 0.8,
    marginTop: spacing.s16,
    marginBottom: spacing.s8,
  },
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
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s8,
  },
  bottomInfoText: { color: colors.textSecondary, fontSize: 13 },
  bottomPrice: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 15,
  },
  continueBtn: {
    width: '100%',
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.s8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.midnight[600],
  },
  continueBtnText: {
    color: colors.midnight[950],
    fontSize: 15,
    fontFamily: theme.typography.family.primary.bold,
  },
  continueBtnTextOutline: { color: colors.textSecondary },
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
    fontFamily: theme.typography.family.primary.bold,
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
    fontFamily: theme.typography.family.primary.bold,
  },
  cinemaAddress: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  selectedCinemaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.s16,
    marginTop: spacing.s12,
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s8,
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s8,
    borderWidth: 1,
    borderColor: colors.midnight[600],
  },
  selectedCinemaText: {
    color: colors.textPrimary,
    fontSize: 13,
    flex: 1,
  },
  changeCinemaText: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: theme.typography.family.primary.bold,
    marginLeft: spacing.s8,
  },
});
