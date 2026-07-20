import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight, MapPin, Search, ShoppingCart, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../../components/ui/AppText';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { theme } from '../../../constants';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { getCinemas } from '../../../services/cinemas.service';
import {
    getAvailableCombos,
    getAvailableProducts,
} from '../../../services/concessions.service';
import { appAlert } from '../../../context/AlertContext';

const { colors, spacing, borderRadius } = theme;

const LINE_TYPE_PRODUCT = 1;
const LINE_TYPE_COMBO = 2;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getPrice = (item) => {
  if (item.pricing?.final_price !== undefined)
    return Number(item.pricing.final_price);
  if (item.price !== undefined) return Number(item.price);
  return 0;
};
const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;
// El backend expone la categoría como `description` (no `name`)
const getCategoryName = (item) =>
  item._ProductCategories?.description ||
  item._ProductCategories?.name ||
  item.product_category?.description ||
  item.product_category?.name ||
  null;
const getCategoryId = (item) =>
  item._ProductCategories?.id ?? item.product_category ?? null;

// Disponibilidad: los productos de /available traen `stock`; si el campo no
// viene (catálogo público) se asume disponible para no bloquear nada.
const isProductAvailable = (p) =>
  p.stock === undefined || (p.stock ?? 0) > 0;

// Un combo está disponible si todos sus productos tienen stock suficiente
const isComboAvailable = (combo, stockMap) => {
  const parts = combo._ComboProducts || [];
  if (parts.length === 0) return true;
  return parts.every((cp) => (stockMap.get(cp.product) ?? 0) >= cp.quantity);
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const ALL_TAB = { id: 'all', label: 'Todo' };
const COMBOS_TAB = { id: 'combos', label: 'Combos' };

function buildCategoryTabs(products) {
  const seen = new Map();
  for (const p of products) {
    const name = getCategoryName(p);
    const id = getCategoryId(p);
    if (name && id != null && !seen.has(id)) seen.set(id, name);
  }
  return [...seen.entries()].map(([id, label]) => ({ id, label }));
}

// ─── Card con botones +/- ─────────────────────────────────────────────────────
function CatalogCard({ item, isCombo, quantity, onAdd, onRemove, available = true }) {
  const price = getPrice(item);
  const imageUri = item.image_url || item.imageUrl;

  return (
    <View style={cardStyles.card}>
      {/* Imagen */}
      <View style={cardStyles.imageZone}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={cardStyles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={cardStyles.imageFallback}>
            <AppText style={cardStyles.fallbackEmoji}>
              {isCombo ? '🎁' : '🍿'}
            </AppText>
          </View>
        )}
        {isCombo && (
          <View style={cardStyles.badge}>
            <AppText style={cardStyles.badgeText}>COMBO</AppText>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={cardStyles.infoZone}>
        <AppText style={cardStyles.name} numberOfLines={2}>
          {item.name?.toUpperCase()}
        </AppText>

        <View style={cardStyles.footerRow}>
          <AppText style={cardStyles.price}>{fmt(price)}</AppText>
          {available ? (
            <View style={cardStyles.counter}>
              <TouchableOpacity
                style={[cardStyles.btn, quantity === 0 && cardStyles.btnDisabled]}
                onPress={onRemove}
                disabled={quantity === 0}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppText
                  style={[
                    cardStyles.btnText,
                    quantity === 0 && cardStyles.btnTextDisabled,
                  ]}
                >
                  −
                </AppText>
              </TouchableOpacity>
              <AppText style={cardStyles.qty}>{quantity}</AppText>
              <TouchableOpacity
                style={cardStyles.btn}
                onPress={onAdd}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppText style={cardStyles.btnText}>+</AppText>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {!available && (
          <View style={cardStyles.unavailablePill}>
            <AppText style={cardStyles.unavailableText}>No disponible</AppText>
          </View>
        )}
      </View>
    </View>
  );
}

const BTN = 28;
const cardStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.midnight[900],
    borderRadius: borderRadius.s16,
    overflow: 'hidden',
  },
  imageZone: { width: '100%', aspectRatio: 1, position: 'relative' },
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
  counter: { flexDirection: 'row', alignItems: 'center', gap: spacing.s4 },
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

// ─── Tab pill ─────────────────────────────────────────────────────────────────
function CategoryTab({ label, isActive, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tab, isActive && styles.tabActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <AppText style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function ConcessionsCatalogScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const {
    cart,
    addProduct,
    updateProductQuantity,
    removeProduct,
    setCinemaId,
    clearProducts,
  } = useCart();
  const { cinemaId: cinemaIdParam } = useLocalSearchParams();

  // ─── Selección de sucursal ────────────────────────────────────────────────
  const [selectedCinema, setSelectedCinema] = useState(
    cinemaIdParam ? { id: Number(cinemaIdParam) } : null
  );
  const [cinemas, setCinemas] = useState([]);
  const [cinemaModalVisible, setCinemaModalVisible] = useState(false);
  const [loadingCinemas, setLoadingCinemas] = useState(!cinemaIdParam);

  // Guardamos la sucursal elegida en el carrito. Si cambia respecto a la que
  // ya tenía el carrito y hay productos viejos, los limpiamos para no mezclar
  // inventario de sucursales distintas (el checkout lo rechazaría con 404).
  useEffect(() => {
    if (!selectedCinema?.id) return;
    const newId = Number(selectedCinema.id);
    if (
      cart.cinemaId &&
      Number(cart.cinemaId) !== newId &&
      cart.products.length > 0
    ) {
      clearProducts();
    }
    setCinemaId(newId);
  }, [
    selectedCinema?.id,
    setCinemaId,
    clearProducts,
    cart.cinemaId,
    cart.products.length,
  ]);

  useEffect(() => {
    if (cinemaIdParam) return;
    let isMounted = true;
    const fetchCinemas = async () => {
      setLoadingCinemas(true);
      try {
        const response = await getCinemas();
        // getCinemas devuelve { data: [...], metadata } — normalizamos al array
        const data = Array.isArray(response) ? response : response?.data || [];
        if (isMounted && data && data.length > 0) {
          setCinemas(data);
          setCinemaModalVisible(true);
        } else if (isMounted) {
          appAlert('Sin sucursales', 'No hay sucursales disponibles.');
        }
      } catch {
        if (isMounted) {
          appAlert('Error de conexión', 'No se pudo cargar las sucursales.');
        }
      } finally {
        if (isMounted) setLoadingCinemas(false);
      }
    };
    fetchCinemas();
    return () => {
      isMounted = false;
    };
  }, [cinemaIdParam]);

  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const searchRef = useRef(null);

  // ─── Carga catálogo filtrado por sucursal ─────────────────────────────────
  const fetchAll = useCallback(
    async (isRefresh = false, cinema = selectedCinema) => {
      if (!cinema) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const [pRes, cRes] = await Promise.all([
          getAvailableProducts(cinema.id),
          getAvailableCombos(cinema.id),
        ]);
        setProducts(Array.isArray(pRes) ? pRes : pRes?.rows || []);
        setCombos(Array.isArray(cRes) ? cRes : cRes?.rows || []);
      } catch (err) {
        console.error('Error cargando catálogo:', err);
        appAlert('Error', 'No se pudo cargar el catálogo de esta sucursal.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCinema]
  );

  useEffect(() => {
    if (selectedCinema) fetchAll(false, selectedCinema);
  }, [selectedCinema, fetchAll]);

  // ─── Tabs dinámicas ──────────────────────────────────────────────────────
  const categoryTabs = useMemo(
    () => [ALL_TAB, ...buildCategoryTabs(products), COMBOS_TAB],
    [products]
  );

  // ─── Disponibilidad ───────────────────────────────────────────────────────
  // Mapa producto → stock para evaluar la disponibilidad de los combos
  const stockMap = useMemo(() => {
    const map = new Map();
    for (const p of products) map.set(p.id, p.stock ?? 0);
    return map;
  }, [products]);

  const isItemAvailable = useCallback(
    (item, isCombo) =>
      isCombo ? isComboAvailable(item, stockMap) : isProductAvailable(item),
    [stockMap]
  );

  // ─── Datos filtrados ──────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    let items =
      activeTab === 'all'
        ? [...combos.map((c) => ({ ...c, _isCombo: true })), ...products]
        : activeTab === 'combos'
          ? combos.map((c) => ({ ...c, _isCombo: true }))
          : products.filter((p) => getCategoryId(p) === activeTab);
    if (q) items = items.filter((i) => i.name?.toLowerCase().includes(q));
    return items;
  }, [products, combos, activeTab, search]);

  // ─── Carrito ──────────────────────────────────────────────────────────────
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
      const price = getPrice(item);
      if (existing) {
        updateProductQuantity(item.id, existing.quantity + 1, isCombo);
      } else {
        addProduct({
          productId: isCombo ? undefined : item.id,
          comboId: isCombo ? item.id : undefined,
          name: item.name,
          price,
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

  // ─── Render por item ──────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }) => {
      const lineType = item._isCombo ? LINE_TYPE_COMBO : LINE_TYPE_PRODUCT;
      return (
        <View style={styles.cardWrapper}>
          <CatalogCard
            item={item}
            isCombo={!!item._isCombo}
            quantity={getItemQuantity(item.id, lineType)}
            onAdd={() => handleAdd(item, lineType)}
            onRemove={() => handleRemove(item, lineType)}
            available={isItemAvailable(item, !!item._isCombo)}
          />
        </View>
      );
    },
    [getItemQuantity, handleAdd, handleRemove, isItemAvailable]
  );

  const renderEmpty = () =>
    loading ? null : (
      <View style={styles.emptyBox}>
        <AppText style={styles.emptyEmoji}>🔍</AppText>
        <AppText style={styles.emptyText}>
          {search ? `Sin resultados para "${search}"` : 'No hay productos aquí'}
        </AppText>
      </View>
    );

  const bottomPad = (insets.bottom || 16) + 56 + spacing.s12 + spacing.s16;

  if (loadingCinemas) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText style={styles.emptyText}>Cargando sucursales...</AppText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Modal selector de sucursal */}
      <Modal visible={cinemaModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>Elige tu sucursal</AppText>
              <TouchableOpacity onPress={() => setCinemaModalVisible(false)}>
                <X size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
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
                  {!!item.address && (
                    <AppText style={styles.cinemaAddress}>{item.address}</AppText>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <AppText variant="h2" style={styles.headerTitle}>
          Confitería
        </AppText>
        <AppText style={styles.headerSub}>
          Dulces, combos y bebidas para tu función
        </AppText>
      </View>

      {/* Selector de sucursal */}
      <TouchableOpacity
        style={styles.cinemaBar}
        onPress={() => {
          if (cinemas.length === 0) {
            getCinemas().then((response) => {
              const data = Array.isArray(response)
                ? response
                : response?.data || [];
              if (data?.length) {
                setCinemas(data);
                setCinemaModalVisible(true);
              }
            });
          } else {
            setCinemaModalVisible(true);
          }
        }}
        activeOpacity={0.8}
      >
        <MapPin size={16} color={colors.primary} />
        <AppText style={styles.cinemaBarText} numberOfLines={1}>
          {selectedCinema?.name || 'Elige tu sucursal'}
        </AppText>
        <ChevronRight size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Búsqueda */}
      <View style={styles.searchBar}>
        <Search size={18} color={colors.textSecondary} />
        <TextInput
          ref={searchRef}
          style={styles.searchInput}
          placeholder="Buscar producto o combo..."
          placeholderTextColor={colors.textDisabled}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearch('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {categoryTabs.map((tab) => (
          <CategoryTab
            key={String(tab.id)}
            label={tab.label}
            isActive={activeTab === tab.id}
            onPress={() => setActiveTab(tab.id)}
          />
        ))}
      </ScrollView>

      {/* Contador */}
      {!loading && (
        <AppText style={styles.resultCount}>
          {filteredItems.length}{' '}
          {filteredItems.length === 1 ? 'producto' : 'productos'}
        </AppText>
      )}

      {/* Grid */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item, i) =>
            `${item._isCombo ? 'c' : 'p'}-${item.id}-${i}`
          }
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.gridContent,
            { paddingBottom: bottomPad + (itemCount > 0 ? 36 : 0) },
          ]}
          style={styles.flatList}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchAll(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}

      {/* Barra inferior — solo visible cuando hay ítems */}
      {itemCount > 0 && (
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: insets.bottom || spacing.s16 },
          ]}
        >
          <View style={styles.bottomInfo}>
            <View style={styles.bottomInfoLeft}>
              <ShoppingCart size={16} color={colors.primary} />
              <AppText style={styles.bottomInfoText}>
                {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
              </AppText>
            </View>
            <AppText style={styles.bottomPrice}>{fmt(concessionTotal)}</AppText>
          </View>

          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => {
              if (!selectedCinema) {
                appAlert(
                  'Sucursal requerida',
                  'Por favor selecciona una sucursal primero.'
                );
                setCinemaModalVisible(true);
                return;
              }
              if (!isAuthenticated) {
                router.push({
                  pathname: '/(auth)/login',
                  params: {
                    redirectTo: '/(buy)/checkout',
                    mode: 'concessions',
                    cinemaId: String(selectedCinema.id),
                  },
                });
              } else {
                router.push({
                  pathname: '/(buy)/checkout',
                  params: {
                    mode: 'concessions',
                    cinemaId: String(selectedCinema.id),
                  },
                });
              }
            }}
            activeOpacity={0.8}
          >
            <AppText style={styles.continueBtnText}>
              {isAuthenticated
                ? 'Ver resumen del pedido'
                : 'Iniciar sesión para continuar'}
            </AppText>
          </TouchableOpacity>
        </View>
      )}
    </ScreenWrapper>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.s16,
    paddingTop: spacing.s16,
    paddingBottom: spacing.s8,
  },
  headerTitle: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
  },
  headerSub: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.s4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.midnight[800],
    marginHorizontal: spacing.s16,
    marginBottom: spacing.s12,
    borderRadius: borderRadius.s8,
    borderWidth: 1,
    borderColor: colors.midnight[600],
    paddingHorizontal: spacing.s12,
    height: 46,
    gap: spacing.s8,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: theme.typography.family.primary.regular,
    fontSize: 14,
    padding: 0,
  },
  tabsScroll: { flexGrow: 0, flexShrink: 0 },
  tabsContent: {
    paddingHorizontal: spacing.s16,
    paddingBottom: spacing.s12,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s8,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: colors.midnight[600],
    backgroundColor: colors.midnight[800],
    marginRight: spacing.s8,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabLabel: {
    fontSize: 13,
    fontFamily: theme.typography.family.primary.regular,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.midnight[950],
    fontFamily: theme.typography.family.primary.bold,
  },
  resultCount: {
    color: colors.textSecondary,
    fontSize: 12,
    paddingHorizontal: spacing.s16,
    marginBottom: spacing.s8,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  flatList: { flex: 1 },
  gridContent: { paddingHorizontal: spacing.s16 },
  row: { justifyContent: 'space-between', marginBottom: spacing.s8 },
  cardWrapper: { width: '48.5%' },
  emptyBox: { paddingTop: spacing.s48, alignItems: 'center', gap: spacing.s12 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { color: colors.textSecondary, textAlign: 'center', fontSize: 14 },

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
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.s8,
  },
  bottomInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s8,
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
  continueBtnText: {
    color: colors.midnight[950],
    fontSize: 15,
    fontFamily: theme.typography.family.primary.bold,
  },

  // ── Modal sucursal (mismo patrón que Premios: bottom-sheet) ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.midnight[900],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: spacing.s24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.s16,
    borderBottomWidth: 1,
    borderBottomColor: colors.midnight[700],
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: theme.typography.family.primary.bold,
  },
  cinemaOption: {
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s16,
    borderBottomWidth: 1,
    borderBottomColor: colors.midnight[800],
  },
  cinemaName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: theme.typography.family.primary.bold,
  },
  cinemaAddress: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },

  // ── Barra de sucursal (mismo patrón que Premios) ──
  cinemaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s8,
    marginHorizontal: spacing.s16,
    marginBottom: spacing.s12,
    paddingHorizontal: spacing.s12,
    paddingVertical: 10,
    backgroundColor: colors.midnight[800],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  cinemaBarText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: theme.typography.family.primary.bold,
  },
});
