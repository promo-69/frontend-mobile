import { useRouter } from 'expo-router';
import { Award, ChevronLeft, Clock, Gift, Star } from 'lucide-react-native';
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

export default function LoyaltyScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);
  const [levels, setLevels] = useState(null);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      // Cargamos balance/nivel y la tabla de niveles en paralelo
      const [infoData, levelsData] = await Promise.all([
        usersService.getLoyaltyInfo(),
        usersService.getLoyaltyLevels().catch(() => null),
      ]);
      setInfo(infoData);
      setLevels(levelsData);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recargamos cada vez que la pantalla toma foco (p. ej. tras un canje)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const pointsBalance = info?.points_balance ?? 0;
  const levelName = info?.loyalty_level_name || 'Sin nivel';
  const progressPoints =
    levels?.level_progress_points ?? info?.level_progress_points ?? 0;
  const nextLevel = levels?.next_level ?? null;
  const pointsToNext = levels?.points_to_next_level ?? 0;
  const currentLevelPoints = Number(
    levels?.current_level?.required_points ?? 0
  );
  const nextLevelPoints = Number(nextLevel?.required_points ?? 0);

  // ¿Se cargó correctamente la tabla de niveles?
  const levelsLoaded =
    Array.isArray(levels?.levels) && levels.levels.length > 0;
  // ¿El usuario está realmente en el nivel máximo? (niveles cargados y sin siguiente)
  const isMaxLevel = levelsLoaded && !nextLevel;

  // Progreso 0..1 dentro del tramo del nivel actual hacia el siguiente.
  // Por defecto 0 (vacío); solo se llena con datos reales.
  let progressRatio = 0;
  if (isMaxLevel) {
    progressRatio = 1;
  } else if (nextLevel && nextLevelPoints > currentLevelPoints) {
    progressRatio = Math.min(
      1,
      Math.max(
        0,
        (progressPoints - currentLevelPoints) /
          (nextLevelPoints - currentLevelPoints)
      )
    );
  }

  return (
    <ScreenWrapper disableSafeArea={false}>
      {/* Header propio (el layout tiene headerShown:false) */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={26} color={colors.primary} />
        </TouchableOpacity>
        <AppText style={styles.topBarTitle}>CinePuntos</AppText>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <AppText style={styles.errorText}>
            No pudimos cargar tus CinePuntos.
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
          {/* Tarjeta principal de balance */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceIconWrap}>
              <Star
                size={22}
                color={colors.midnight[950]}
                fill={colors.midnight[950]}
              />
            </View>
            <AppText style={styles.balanceLabel}>
              Tus puntos disponibles
            </AppText>
            <AppText style={styles.balanceValue}>
              {pointsBalance.toLocaleString('es-VE')}
            </AppText>
            <View style={styles.levelPill}>
              <Award size={14} color={colors.primary} />
              <AppText style={styles.levelPillText}>{levelName}</AppText>
            </View>
          </View>

          {/* Progreso hacia el siguiente nivel */}
          <View style={styles.card}>
            <AppText style={styles.cardTitle}>Progreso de nivel</AppText>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round(progressRatio * 100)}%` },
                ]}
              />
            </View>
            {nextLevel ? (
              <AppText style={styles.progressText}>
                Te faltan{' '}
                <AppText style={styles.progressHighlight}>
                  {pointsToNext.toLocaleString('es-VE')} pts
                </AppText>{' '}
                para alcanzar {nextLevel.name}
              </AppText>
            ) : isMaxLevel ? (
              <AppText style={styles.progressText}>
                ¡Estás en el nivel máximo! 🎉
              </AppText>
            ) : (
              <AppText style={styles.progressText}>
                Acumula puntos para subir de nivel.
              </AppText>
            )}
          </View>

          {/* Accesos a historial y premios */}
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/profile/loyalty-program/history')}
            activeOpacity={0.8}
          >
            <View style={styles.linkIconWrap}>
              <Clock size={18} color={colors.primary} />
            </View>
            <View style={styles.linkTexts}>
              <AppText style={styles.linkTitle}>
                Historial de movimientos
              </AppText>
              <AppText style={styles.linkSub}>
                Revisa cómo ganaste y usaste tus puntos
              </AppText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/profile/loyalty-program/rewards')}
            activeOpacity={0.8}
          >
            <View style={styles.linkIconWrap}>
              <Gift size={18} color={colors.primary} />
            </View>
            <View style={styles.linkTexts}>
              <AppText style={styles.linkTitle}>Niveles y beneficios</AppText>
              <AppText style={styles.linkSub}>
                Conoce los niveles del programa
              </AppText>
            </View>
          </TouchableOpacity>

          <View style={styles.infoNote}>
            <AppText style={styles.infoNoteText}>
              💡 Puedes canjear tus CinePuntos como método de pago al comprar
              boletos o confitería.
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
    gap: spacing.s16,
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
  scroll: {
    paddingHorizontal: spacing.s16,
    paddingBottom: spacing.s32,
    gap: spacing.s16,
  },
  balanceCard: {
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    paddingVertical: spacing.s24,
    paddingHorizontal: spacing.s16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.midnight[700],
    gap: spacing.s8,
  },
  balanceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s4,
  },
  balanceLabel: { color: colors.textSecondary, fontSize: 13 },
  balanceValue: {
    color: colors.primary,
    fontSize: 40,
    fontFamily: theme.typography.family.primary.bold,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s4,
    backgroundColor: 'rgba(246,173,56,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(246,173,56,0.4)',
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s4,
    borderRadius: 20,
    marginTop: spacing.s4,
  },
  levelPillText: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: theme.typography.family.primary.bold,
  },
  card: {
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    padding: spacing.s16,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    gap: spacing.s12,
  },
  cardTitle: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: theme.typography.family.primary.bold,
  },
  progressTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.midnight[900],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  progressText: { color: colors.textSecondary, fontSize: 13 },
  progressHighlight: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s12,
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    padding: spacing.s16,
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  linkIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(246,173,56,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkTexts: { flex: 1, gap: 2 },
  linkTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: theme.typography.family.primary.bold,
  },
  linkSub: { color: colors.textSecondary, fontSize: 12 },
  infoNote: {
    backgroundColor: 'rgba(246,173,56,0.10)',
    borderRadius: borderRadius.s8,
    borderWidth: 1,
    borderColor: 'rgba(246,173,56,0.3)',
    padding: spacing.s12,
  },
  infoNoteText: { color: colors.gold[200], fontSize: 12, lineHeight: 18 },
});
