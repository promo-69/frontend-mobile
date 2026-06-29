import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { theme } from '../../constants';
import { AppText } from './ui/AppText';

const { colors, spacing, borderRadius } = theme;

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-VE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Fila de un movimiento del historial de CinePuntos (ganancia o canje).
 * @param {Object} props
 * @param {Object} props.transaction - Registro de loyalty_ledgers
 */
export function LoyaltyTransactionItem({ transaction }) {
  const isIncrement =
    transaction?._OperationTypes?.is_increment ?? transaction.points > 0;
  const description =
    transaction?._OperationTypes?.description ||
    transaction?.remarks ||
    (isIncrement ? 'Acumulación de puntos' : 'Canje de puntos');

  const orderRef = transaction?._Orders?.id
    ? `Orden #${transaction._Orders.id}`
    : null;

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.iconWrap,
          isIncrement ? styles.iconWrapPositive : styles.iconWrapNegative,
        ]}
      >
        {isIncrement ? (
          <ArrowUpCircle size={20} color={colors.green[400]} />
        ) : (
          <ArrowDownCircle size={20} color={colors.red[400]} />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <AppText variant="smallText" style={styles.description}>
          {description}
        </AppText>
        <AppText variant="caption" style={styles.meta}>
          {formatDate(transaction.created_at)}
          {orderRef ? ` · ${orderRef}` : ''}
        </AppText>
      </View>

      <AppText
        variant="smallText"
        style={[
          styles.points,
          isIncrement ? styles.pointsPositive : styles.pointsNegative,
        ]}
      >
        {isIncrement ? '+' : ''}
        {transaction.points} pts
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s12,
    paddingVertical: spacing.s12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sFull,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapPositive: { backgroundColor: `${colors.green[400]}22` },
  iconWrapNegative: { backgroundColor: `${colors.red[400]}22` },
  description: { color: colors.textPrimary },
  meta: { color: colors.textSecondary, marginTop: 2 },
  points: { fontFamily: theme.typography.family.primary.bold },
  pointsPositive: { color: colors.green[400] },
  pointsNegative: { color: colors.red[400] },
});
