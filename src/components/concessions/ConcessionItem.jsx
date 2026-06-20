import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText } from '../AppText';
import { theme } from '../../constants';

const { colors, spacing, borderRadius } = theme;

export default function ConcessionItem({
  item,
  quantity,
  onAdd,
  onRemove,
  isCombo,
}) {
  const price = `$${Number(item.price || 0).toFixed(2)}`;
  const imageUri = item.image_url || item.imageUrl;
  // Combos y productos comparten el mismo fondo oscuro (midnight[900])
  const cardBg = colors.midnight[900];

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      {/* ── Zona imagen ── */}
      <View style={styles.imageZone}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imageFallback}>
            <AppText style={styles.fallbackEmoji}>
              {isCombo ? '🎁' : '🍿'}
            </AppText>
          </View>
        )}
        {/* Badge COMBO */}
        {isCombo && (
          <View style={styles.badge}>
            <AppText style={styles.badgeText}>COMBO</AppText>
          </View>
        )}
      </View>

      {/* ── Zona info ── */}
      <View style={styles.infoZone}>
        {/* Nombre en mayúsculas */}
        <AppText style={styles.name} numberOfLines={2}>
          {item.name?.toUpperCase()}
        </AppText>

        {/* Precio + contador en la misma fila */}
        <View style={styles.footerRow}>
          <AppText style={styles.price}>{price}</AppText>

          <View style={styles.counter}>
            <TouchableOpacity
              style={[
                styles.counterBtn,
                quantity === 0 && styles.counterBtnDisabled,
              ]}
              onPress={onRemove}
              disabled={quantity === 0}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <AppText
                style={[
                  styles.counterBtnText,
                  quantity === 0 && styles.counterBtnTextDisabled,
                ]}
              >
                −
              </AppText>
            </TouchableOpacity>

            <AppText style={styles.counterValue}>{quantity}</AppText>

            <TouchableOpacity
              style={styles.counterBtn}
              onPress={onAdd}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <AppText style={styles.counterBtnText}>+</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const BTN_SIZE = 28;

const styles = StyleSheet.create({
  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    flex: 1,
    borderRadius: borderRadius.s16,
    overflow: 'hidden',
  },

  // ── Imagen ────────────────────────────────────────────────────────────────
  imageZone: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.midnight[800],
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackEmoji: { fontSize: 36 },

  // ── Badge ─────────────────────────────────────────────────────────────────
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

  // ── Info ──────────────────────────────────────────────────────────────────
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
    letterSpacing: 0.2,
    minHeight: 30, // reserva espacio para 2 líneas y evita saltos de layout
  },

  // ── Footer: precio + contador ─────────────────────────────────────────────
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: colors.primary,
    fontSize: 15,
    fontFamily: theme.typography.family.primary.bold,
    lineHeight: 18,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s4,
  },
  counterBtn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: borderRadius.s4,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDisabled: {
    backgroundColor: colors.midnight[700],
  },
  counterBtnText: {
    color: colors.midnight[950],
    fontSize: 17,
    lineHeight: BTN_SIZE,
    fontFamily: theme.typography.family.primary.bold,
    textAlign: 'center',
  },
  counterBtnTextDisabled: {
    color: colors.textSecondary,
  },
  counterValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: theme.typography.family.primary.bold,
    minWidth: 18,
    textAlign: 'center',
  },
});
