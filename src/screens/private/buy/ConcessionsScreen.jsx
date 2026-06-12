import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../../components/AppText';
import { useCart } from '../../../context/CartContext';
import {
  getAvailableCombos,
  getAvailableProducts,
} from '../../../services/concessions.service';
import { theme } from '../../../constants';

const { colors, spacing, borderRadius } = theme;

const LINE_TYPE_PRODUCT = 1;
const LINE_TYPE_COMBO = 2;

// ─── ConcessionItem (inline para evitar problemas de path) ───────────────────
function ConcessionItem({ item, quantity, onAdd, onRemove, isCombo }) {
  const price = `$${Number(item.price || 0).toFixed(2)}`;
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
        </View>
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
});

// ─── Grid de 2 columnas por sección ──────────────────────────────────────────
function GridSection({ items, lineType, getQuantity, onAdd, onRemove }) {
  const rows = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));

  return (
    <View style={gridStyles.section}>
      {rows.map((row, ri) => (
        <View key={ri} style={gridStyles.row}>
          {row.map((item) => (
            <View key={item.id} style={gridStyles.cell}>
              <ConcessionItem
                item={item}
                isCombo={lineType === LINE_TYPE_COMBO}
                quantity={getQuantity(item.id, lineType)}
                onAdd={() => onAdd(item, lineType)}
                onRemove={() => onRemove(item, lineType)}
              />
            </View>
          ))}
          {row.length === 1 && <View style={gridStyles.cell} />}
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
  if (combos.length > 0) {
    sections.push({ title: 'Combos', data: combos, lineType: LINE_TYPE_COMBO });
  }
  const byCategory = {};
  for (const p of products) {
    const cat =
      p._ProductCategories?.name || p.product_category?.name || 'Otros';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
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
  const { showtimeId, movieId, cinemaId } = useLocalSearchParams();
  const { cart, addProduct, updateProductQuantity, removeProduct } = useCart();

  const [loading, setLoading] = useState(true);
  const [combos, setCombos] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [cRes, pRes] = await Promise.all([
          getAvailableCombos(cinemaId),
          getAvailableProducts(cinemaId),
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
          Alert.alert('Error', msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

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
          price: Number(item.price),
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

  const goToCheckout = () =>
    router.push({
      pathname: '/(buy)/checkout',
      params: { showtimeId, movieId, cinemaId },
    });

  const bottomPad = (insets.bottom || 16) + 56 + spacing.s12 + spacing.s16;

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

      <AppText style={styles.subtitle}>
        ¡Selecciona tus productos de confitería para hoy!
      </AppText>

      <SectionList
        sections={sections}
        keyExtractor={(item, i) => `${item.id}-${i}`}
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
});
