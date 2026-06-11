import { Search, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppText } from '../../../components/AppText';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import {
  getAllCombos,
  getAllProducts,
} from '../../../services/concessions.service';
import { theme } from '../../../constants';

const { colors, spacing, borderRadius } = theme;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getPrice = (item) => {
  if (item.pricing?.final_price !== undefined)
    return Number(item.pricing.final_price);
  if (item.price !== undefined) return Number(item.price);
  return 0;
};
const getBasePrice = (item) => {
  if (item.pricing?.base_price !== undefined)
    return Number(item.pricing.base_price);
  return null;
};
const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;
const getCategoryName = (item) =>
  item._ProductCategories?.name || item.product_category?.name || null;
const getCategoryId = (item) =>
  item._ProductCategories?.id ?? item.product_category ?? null;

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

// ─── Card ─────────────────────────────────────────────────────────────────────
// Diseño fiel a la referencia:
//  • Fondo oscuro midnight[900] para combos, midnight[800] para productos
//  • Imagen grande que ocupa la parte superior (4:3 ratio)
//  • Overlay sutil en la parte inferior de la imagen para el badge COMBO
//  • Zona inferior blanca-oscura con nombre en mayúsculas, precio dorado y puntos
function CatalogCard({ item, isCombo }) {
  const price = getPrice(item);
  const basePrice = getBasePrice(item);
  const hasDiscount = basePrice !== null && basePrice > price;
  const imageUri = item.image_url || item.imageUrl;
  const cardBg = isCombo ? colors.midnight[900] : colors.midnight[800];

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      {/* ── Zona de imagen ── */}
      <View style={styles.imageZone}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imageFallback, { backgroundColor: cardBg }]}>
            <AppText style={styles.fallbackEmoji}>
              {isCombo ? '🎁' : '🍿'}
            </AppText>
          </View>
        )}
        {/* Badge COMBO — esquina superior izquierda */}
        {isCombo && (
          <View style={styles.comboBadge}>
            <AppText style={styles.comboBadgeText}>COMBO</AppText>
          </View>
        )}
      </View>

      {/* ── Zona de info ── */}
      <View style={styles.infoZone}>
        {/* Nombre en mayúsculas, estilo referencia */}
        <AppText style={styles.itemName} numberOfLines={2}>
          {item.name?.toUpperCase()}
        </AppText>

        {/* Precio */}
        <View style={styles.priceRow}>
          <AppText style={styles.finalPrice}>{fmt(price)}</AppText>
          {hasDiscount && (
            <AppText style={styles.originalPrice}>{fmt(basePrice)}</AppText>
          )}
        </View>

        {/* CinePuntos */}
        {item.earned_loyalty_points > 0 && (
          <AppText style={styles.loyaltyPts}>
            +{item.earned_loyalty_points} pts
          </AppText>
        )}
      </View>
    </View>
  );
}

// ─── Tab pill ────────────────────────────────────────────────────────────────
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

// ─── Pantalla ─────────────────────────────────────────────────────────────────
export default function ConcessionsCatalogScreen() {
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const searchRef = useRef(null);

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        getAllProducts(),
        getAllCombos(),
      ]);
      setProducts(Array.isArray(pRes) ? pRes : pRes?.rows || []);
      setCombos(Array.isArray(cRes) ? cRes : cRes?.rows || []);
    } catch (err) {
      console.error('Error cargando catálogo:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const categoryTabs = useMemo(() => {
    return [ALL_TAB, COMBOS_TAB, ...buildCategoryTabs(products)];
  }, [products]);

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

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.cardWrapper}>
        <CatalogCard item={item} isCombo={!!item._isCombo} />
      </View>
    ),
    []
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

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="h2" style={styles.headerTitle}>
          Confitería
        </AppText>
        <AppText style={styles.headerSub}>
          Dulces, combos y bebidas para tu función
        </AppText>
      </View>

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

      {/* Tabs — scroll horizontal con marginRight en cada item */}
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

      {/* Grid — flex:1 para que no haya espacio muerto debajo */}
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
          contentContainerStyle={styles.gridContent}
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
    </ScreenWrapper>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const CARD_GAP = spacing.s8;
// Ancho de cada card: 50% del contenedor menos la mitad del gap entre ellas
const CARD_WIDTH = '48.5%';

const styles = StyleSheet.create({
  // Header
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
    fontSize: theme.typography.size.s12,
    marginTop: spacing.s4,
  },

  // Búsqueda
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

  // Tabs — gap real con marginRight por item
  tabsScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
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
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  // Usamos fontSize explícito para evitar dependencia de variantes
  tabLabel: {
    fontSize: 13,
    fontFamily: theme.typography.family.primary.regular,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.midnight[950],
    fontFamily: theme.typography.family.primary.bold,
  },

  // Contador
  resultCount: {
    color: colors.textSecondary,
    fontSize: 12,
    paddingHorizontal: spacing.s16,
    marginBottom: spacing.s8,
  },

  // Grid
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  flatList: { flex: 1 }, // ← elimina el espacio morado al fondo
  gridContent: {
    paddingHorizontal: spacing.s16,
    paddingBottom: spacing.s32,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
  cardWrapper: { width: CARD_WIDTH },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    borderRadius: borderRadius.s16,
    overflow: 'hidden',
  },

  // Imagen: ocupa la parte superior, ratio 4:3 para ser más alta que el cuadrado
  imageZone: {
    width: '100%',
    aspectRatio: 1, // cuadrado, igual que la referencia
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  imageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackEmoji: { fontSize: 40 },

  // Badge COMBO
  comboBadge: {
    position: 'absolute',
    top: spacing.s8,
    left: spacing.s8,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.s4,
    paddingHorizontal: spacing.s8,
    paddingVertical: 3,
  },
  comboBadgeText: {
    color: colors.midnight[950],
    fontSize: 9,
    fontFamily: theme.typography.family.primary.bold,
    letterSpacing: 0.6,
  },

  // Zona de texto inferior — fondo ligeramente distinto para contraste
  infoZone: {
    paddingHorizontal: spacing.s8,
    paddingTop: spacing.s8,
    paddingBottom: spacing.s12,
    gap: spacing.s4,
  },
  itemName: {
    color: colors.textPrimary,
    fontSize: 11,
    fontFamily: theme.typography.family.primary.regular,
    lineHeight: 15,
    letterSpacing: 0.2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s4,
  },
  finalPrice: {
    color: colors.primary,
    fontSize: 16,
    fontFamily: theme.typography.family.primary.bold,
    lineHeight: 20,
  },
  originalPrice: {
    color: colors.textSecondary,
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  loyaltyPts: {
    color: colors.gold[300],
    fontSize: 11,
    fontFamily: theme.typography.family.primary.bold,
  },

  // Vacío
  emptyBox: {
    paddingTop: spacing.s48,
    alignItems: 'center',
    gap: spacing.s12,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: { color: colors.textSecondary, textAlign: 'center', fontSize: 14 },
});
