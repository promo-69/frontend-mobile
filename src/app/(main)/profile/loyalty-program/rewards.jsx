import { useRouter } from 'expo-router';
import { ChevronLeft, Lock, Unlock } from 'lucide-react-native';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppText } from '../../../../components/AppText';
import { ScreenWrapper } from '../../../../components/ScreenWrapper';
import { useLoyalty } from '../../../../hooks/loyalty/useLoyalty';
import { theme } from '../../../../constants';

const { colors, spacing, borderRadius } = theme;

export default function LoyaltyRewardsScreen() {
  const router = useRouter();
  const { levels, pointsBalance, loading, error, refresh } = useLoyalty();

  const levelsList = levels?.levels ?? [];

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={26} color={colors.primary} />
        </TouchableOpacity>
        <AppText variant="h3" style={styles.headerTitle}>Premios</AppText>
        <View style={{ width: 34 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {error && (
            <TouchableOpacity onPress={refresh} style={styles.errorBanner}>
              <AppText variant="caption" style={styles.errorText}>
                {error} Toca para reintentar.
              </AppText>
            </TouchableOpacity>
          )}

          <AppText variant="body" style={styles.intro}>
            Acumula CinePuntos en cada compra y úsalos directamente como medio de pago
            en boletos y confitería. Tus puntos equivalen a Bs al momento de canjear.
          </AppText>

          <AppText variant="caption" style={styles.sectionTitle}>NIVELES DEL PROGRAMA</AppText>

          <View style={styles.levelsCard}>
            {levelsList.map((level, idx) => {
              const unlocked = pointsBalance >= Number(level.required_points ?? 0) ||
                (levels?.current_level && level.id <= levels.current_level.id);
              return (
                <View key={level.id ?? idx}>
                  {idx > 0 && <View style={styles.divider} />}
                  <View style={styles.levelRow}>
                    {unlocked ? (
                      <Unlock size={18} color={colors.green[400]} />
                    ) : (
                      <Lock size={18} color={colors.textSecondary} />
                    )}
                    <View style={{ flex: 1 }}>
                      <AppText variant="smallText" style={styles.levelName}>{level.name}</AppText>
                      <AppText variant="caption" style={styles.levelRequirement}>
                        Desde {Number(level.required_points ?? 0).toLocaleString('es-VE')} pts
                      </AppText>
                    </View>
                  </View>
                </View>
              );
            })}

            {levelsList.length === 0 && (
              <AppText variant="body" style={styles.emptyText}>
                Las reglas del programa estarán disponibles pronto.
              </AppText>
            )}
          </View>

          <AppText variant="caption" style={styles.sectionTitle}>CÓMO CANJEAR</AppText>
          <View style={styles.levelsCard}>
            <AppText variant="smallText" style={styles.ruleText}>
              • En el pago de tu orden, elige "CinePuntos" como método de pago.{'\n'}
              • Puedes combinar puntos con otro método si no cubren el total.{'\n'}
              • 1 punto equivale a 1 Bs al momento de pagar.
            </AppText>
          </View>
        </ScrollView>
      )}
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
  intro: { color: colors.textSecondary },
  sectionTitle: {
    color: colors.textSecondary,
    letterSpacing: 0.8,
    fontSize: 11,
  },
  levelsCard: {
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    padding: spacing.s12,
    gap: spacing.s8,
  },
  divider: { height: 1, backgroundColor: colors.midnight[700], marginVertical: spacing.s8 },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s12,
  },
  levelName: { color: colors.textPrimary, fontFamily: theme.typography.family.primary.bold },
  levelRequirement: { color: colors.textSecondary, marginTop: 2 },
  ruleText: { color: colors.textPrimary, lineHeight: 20 },
  emptyText: { color: colors.textSecondary, textAlign: 'center' },
  errorBanner: {
    backgroundColor: `${colors.red[500]}1A`,
    borderRadius: borderRadius.s8,
    borderWidth: 1,
    borderColor: colors.red[500],
    padding: spacing.s12,
  },
  errorText: { color: colors.red[400] },
});
