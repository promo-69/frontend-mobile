import { Award } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { theme } from '../../constants';
import { AppText } from './ui/AppText';

const { colors, spacing, borderRadius } = theme;

/**
 * Tarjeta de nivel de lealtad con barra de progreso hacia el siguiente nivel.
 *
 * @param {Object} props
 * @param {{ name: string }} props.currentLevel
 * @param {{ name: string, required_points: number }|null} props.nextLevel
 * @param {number} props.progressPoints - Puntos acumulados hacia el progreso de nivel
 * @param {number} props.pointsToNextLevel - Puntos restantes para alcanzar nextLevel
 */
export function LoyaltyLevelCard({
  currentLevel,
  nextLevel,
  progressPoints = 0,
  pointsToNextLevel = 0,
}) {
  const currentRequired = Number(currentLevel?.required_points ?? 0);
  const nextRequired = nextLevel
    ? Number(nextLevel.required_points ?? 0)
    : null;

  // Progreso relativo dentro del rango [nivel actual -> siguiente nivel]
  const rangeTotal =
    nextRequired !== null ? Math.max(1, nextRequired - currentRequired) : 1;
  const rangeProgress =
    nextRequired !== null ? Math.max(0, progressPoints - currentRequired) : 0;
  const progressRatio =
    nextRequired !== null ? Math.min(1, rangeProgress / rangeTotal) : 1;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.levelIconWrap}>
          <Award size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="caption" style={styles.levelLabel}>
            TU NIVEL
          </AppText>
          <AppText variant="h3" style={styles.levelName}>
            {currentLevel?.name?.toUpperCase() || '—'}
          </AppText>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[styles.progressFill, { width: `${progressRatio * 100}%` }]}
        />
      </View>

      <AppText variant="caption" style={styles.progressHint}>
        {nextLevel
          ? `${progressPoints.toLocaleString('es-VE')} / ${nextRequired.toLocaleString('es-VE')} pts · Te faltan ${pointsToNextLevel.toLocaleString('es-VE')} pts para ${nextLevel.name}`
          : '¡Has alcanzado el nivel máximo!'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    padding: spacing.s16,
    gap: spacing.s12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s12,
  },
  levelIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sFull,
    backgroundColor: `${colors.primary}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelLabel: {
    color: colors.textSecondary,
    letterSpacing: 0.8,
    fontSize: 11,
  },
  levelName: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
  },
  progressTrack: {
    height: 10,
    borderRadius: borderRadius.sFull,
    backgroundColor: colors.midnight[900],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.sFull,
    backgroundColor: colors.primary,
  },
  progressHint: {
    color: colors.textSecondary,
  },
});
