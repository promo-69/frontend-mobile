import { useRouter } from 'expo-router';
import { ChevronLeft, History, Gift as GiftIcon } from 'lucide-react-native';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppText } from '../../../../components/AppText';
import { ScreenWrapper } from '../../../../components/ScreenWrapper';
import { LoyaltyLevelCard } from '../../../../components/loyalty/LoyaltyLevelCard';
import { PointsBalanceCard } from '../../../../components/loyalty/PointsBalanceCard';
import { useLoyalty } from '../../../../hooks/loyalty/useLoyalty';
import { theme } from '../../../../constants';

const { colors, spacing, borderRadius } = theme;

export default function LoyaltyScreen() {
  const router = useRouter();
  const {
    pointsBalance,
    nextLevel,
    pointsToNextLevel,
    levels,
    loading,
    error,
    refresh,
  } = useLoyalty();

  if (loading) {
    return (
      <ScreenWrapper style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={26} color={colors.primary} />
        </TouchableOpacity>
        <AppText variant="h3" style={styles.headerTitle}>CinePuntos</AppText>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <TouchableOpacity onPress={refresh} style={styles.errorBanner}>
            <AppText variant="caption" style={styles.errorText}>
              {error} Toca para reintentar.
            </AppText>
          </TouchableOpacity>
        )}

        <LoyaltyLevelCard
          currentLevel={levels?.current_level}
          nextLevel={nextLevel}
          progressPoints={levels?.level_progress_points ?? 0}
          pointsToNextLevel={pointsToNextLevel}
        />

        <PointsBalanceCard pointsBalance={pointsBalance} />

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/profile/loyalty-program/history')}
          >
            <History size={18} color={colors.textPrimary} />
            <AppText variant="smallText" style={styles.actionText}>Ver historial</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/profile/loyalty-program/rewards')}
          >
            <GiftIcon size={18} color={colors.textPrimary} />
            <AppText variant="smallText" style={styles.actionText}>Ver premios</AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.s16,
    paddingTop: spacing.s8,
    paddingBottom: spacing.s12,
  },
  backBtn: { padding: spacing.s4 },
  headerTitle: {
    color: colors.textPrimary,
    fontFamily: theme.typography.family.primary.bold,
  },
  scrollContent: {
    paddingHorizontal: spacing.s16,
    paddingBottom: spacing.s32,
    gap: spacing.s16,
  },
  errorBanner: {
    backgroundColor: `${colors.red[500]}1A`,
    borderRadius: borderRadius.s8,
    borderWidth: 1,
    borderColor: colors.red[500],
    padding: spacing.s12,
  },
  errorText: { color: colors.red[400] },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.s12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s8,
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    paddingVertical: spacing.s12,
  },
  actionText: {
    color: colors.textPrimary,
    fontFamily: theme.typography.family.primary.bold,
  },
});
