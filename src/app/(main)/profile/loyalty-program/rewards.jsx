import { useRouter } from 'expo-router';
import { Check, ChevronLeft, Lock, Star } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppText } from '../../../../components/AppText';
import { ScreenWrapper } from '../../../../components/ScreenWrapper';
import { theme } from '../../../../constants';
import { usersService } from '../../../../services/users.service';

const { colors, spacing, borderRadius } = theme;

function LevelCard({ level, state, progressPoints }) {
  // state: 'achieved' | 'current' | 'locked'
  const required = Number(level.required_points ?? 0);
  const isCurrent = state === 'current';
  const isAchieved = state === 'achieved';

  return (
    <View style={[styles.levelCard, isCurrent && styles.levelCardCurrent]}>
      <View
        style={[
          styles.levelIcon,
          isCurrent && styles.levelIconCurrent,
          isAchieved && styles.levelIconAchieved,
        ]}
      >
        {isAchieved ? (
          <Check size={18} color={colors.midnight[950]} />
        ) : isCurrent ? (
          <Star
            size={18}
            color={colors.midnight[950]}
            fill={colors.midnight[950]}
          />
        ) : (
          <Lock size={16} color={colors.textSecondary} />
        )}
      </View>
      <View style={styles.levelTexts}>
        <AppText
          style={[styles.levelName, isCurrent && styles.levelNameCurrent]}
        >
          {level.name}
        </AppText>
        <AppText style={styles.levelReq}>
          {required.toLocaleString('es-VE')} pts acumulados
        </AppText>
      </View>
      {isCurrent && (
        <View style={styles.currentPill}>
          <AppText style={styles.currentPillText}>Actual</AppText>
        </View>
      )}
    </View>
  );
}

export default function LoyaltyRewardsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await usersService.getLoyaltyLevels();
      setData(result);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const levels = data?.levels ?? [];
  const progressPoints = Number(data?.level_progress_points ?? 0);
  const currentLevelId = data?.current_level?.id ?? null;

  // Clasifica cada nivel respecto al progreso del usuario
  const getState = (level) => {
    if (level.id === currentLevelId) return 'current';
    if (progressPoints >= Number(level.required_points ?? 0)) return 'achieved';
    return 'locked';
  };

  return (
    <ScreenWrapper>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={26} color={colors.primary} />
        </TouchableOpacity>
        <AppText style={styles.topBarTitle}>Niveles del programa</AppText>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <AppText style={styles.errorText}>
            No pudimos cargar los niveles.
          </AppText>
          <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
            <AppText style={styles.retryBtnText}>Reintentar</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <AppText style={styles.intro}>
            Acumula CinePuntos con tus compras y sube de nivel. Estos son los
            niveles del programa de fidelidad:
          </AppText>

          {levels.length === 0 ? (
            <View style={styles.center}>
              <AppText style={styles.emptyText}>
                No hay niveles configurados todavía.
              </AppText>
            </View>
          ) : (
            levels.map((level) => (
              <LevelCard
                key={level.id}
                level={level}
                state={getState(level)}
                progressPoints={progressPoints}
              />
            ))
          )}

          <View style={styles.infoNote}>
            <AppText style={styles.infoNoteText}>
              💡 Tus CinePuntos también sirven como método de pago: en el
              checkout puedes canjearlos para cubrir parte o el total de tu
              compra.
            </AppText>
          </View>
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s12,
  },
  topBarTitle: {
    color: colors.primary,
    fontSize: 18,
    fontFamily: theme.typography.family.primary.bold,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.s12,
    paddingHorizontal: spacing.s24,
    paddingVertical: spacing.s32,
  },
  errorText: { color: colors.textSecondary, fontSize: 15 },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.s24,
    paddingVertical: spacing.s12,
    borderRadius: borderRadius.s8,
  },
  retryBtnText: {
    color: colors.midnight[950],
    fontFamily: theme.typography.family.primary.bold,
  },
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  scroll: {
    paddingHorizontal: spacing.s16,
    paddingBottom: spacing.s32,
    gap: spacing.s12,
  },
  intro: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.s4,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s12,
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    padding: spacing.s16,
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  levelCardCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.midnight[900],
  },
  levelIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.midnight[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelIconCurrent: { backgroundColor: colors.primary },
  levelIconAchieved: { backgroundColor: colors.success },
  levelTexts: { flex: 1, gap: 2 },
  levelName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: theme.typography.family.primary.bold,
  },
  levelNameCurrent: { color: colors.primary },
  levelReq: { color: colors.textSecondary, fontSize: 12 },
  currentPill: {
    backgroundColor: 'rgba(246,173,56,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(246,173,56,0.5)',
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s4,
    borderRadius: 20,
  },
  currentPillText: {
    color: colors.primary,
    fontSize: 11,
    fontFamily: theme.typography.family.primary.bold,
  },
  infoNote: {
    backgroundColor: 'rgba(246,173,56,0.10)',
    borderRadius: borderRadius.s8,
    borderWidth: 1,
    borderColor: 'rgba(246,173,56,0.3)',
    padding: spacing.s12,
    marginTop: spacing.s4,
  },
  infoNoteText: { color: colors.gold[200], fontSize: 12, lineHeight: 18 },
});
