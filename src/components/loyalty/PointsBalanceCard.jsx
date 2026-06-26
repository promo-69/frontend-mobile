import { Coins } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { theme } from '../../constants';
import { AppText } from './ui/AppText';

const { colors, spacing, borderRadius } = theme;

// Tasa fija del programa de lealtad: 1 punto CinePuntos = 1 Bs.
// NOTA: si el backend llega a exponer una tasa oficial de conversión,
// este valor debe reemplazarse por la respuesta del servidor.
const POINTS_TO_BS_RATE = 1;

/**
 * Tarjeta de saldo disponible de CinePuntos, con su equivalencia en Bs.
 * @param {Object} props
 * @param {number} props.pointsBalance
 */
export function PointsBalanceCard({ pointsBalance = 0 }) {
  const bsEquivalence = pointsBalance * POINTS_TO_BS_RATE;

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Coins size={22} color={colors.green[400]} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="caption" style={styles.label}>
          SALDO DISPONIBLE
        </AppText>
        <AppText variant="h2" style={styles.points}>
          {pointsBalance.toLocaleString('es-VE')} pts
        </AppText>
        <AppText variant="caption" style={styles.equivalence}>
          ≈ Bs. {bsEquivalence.toLocaleString('es-VE')}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s12,
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    padding: spacing.s16,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sFull,
    backgroundColor: `${colors.green[400]}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.textSecondary,
    letterSpacing: 0.8,
    fontSize: 11,
  },
  points: {
    color: colors.textPrimary,
    fontFamily: theme.typography.family.primary.bold,
  },
  equivalence: {
    color: colors.textSecondary,
  },
});
