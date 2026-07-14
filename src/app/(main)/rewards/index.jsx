import { useFocusEffect } from '@react-navigation/native';
import {
  Award,
  ChevronRight,
  Gift,
  Lock,
  MapPin,
  Sparkles,
  Star,
  X,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { AppText } from '../../../components/ui/AppText';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { theme } from '../../../constants';
import { getCinemas } from '../../../services/cinemas.service';
import { loyaltyRewardsService } from '../../../services/loyalty-rewards.service';

const { colors, spacing, borderRadius } = theme;

const REWARD_TYPE_LABEL = {
  PRODUCT: 'Producto',
  COMBO: 'Combo',
  BLANK_TICKET: 'Boleto en Blanco',
  TWO_FOR_ONE: '2x1 Entradas',
};

// ─── Tarjeta de premio ──────────────────────────────────────────────────────
function RewardCard({ reward, onRedeem, redeeming }) {
  const disabled = !reward.claimable || redeeming;

  let statusText = null;
  if (!reward.unlocked) statusText = 'Sube de nivel para desbloquearlo';
  else if (!reward.affordable) statusText = 'Puntos insuficientes';

  return (
    <View style={[styles.card, !reward.unlocked && styles.cardLocked]}>
      <View style={styles.cardTop}>
        <View style={styles.cardIconWrap}>
          {reward.unlocked ? (
            <Gift size={18} color={colors.midnight[950]} />
          ) : (
            <Lock size={16} color={colors.textSecondary} />
          )}
        </View>
        <View style={styles.cardTexts}>
          <AppText style={styles.cardName}>{reward.name}</AppText>
          {!!reward.description && (
            <AppText style={styles.cardDesc} numberOfLines={2}>
              {reward.description}
            </AppText>
          )}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.pointsBadge}>
          <Star size={12} color={colors.primary} fill={colors.primary} />
          <AppText style={styles.pointsBadgeText}>
            {Number(reward.points_cost).toLocaleString('es-VE')} pts
          </AppText>
        </View>
        <View style={styles.typeBadge}>
          <AppText style={styles.typeBadgeText}>
            {REWARD_TYPE_LABEL[reward.reward_type] || reward.reward_type}
          </AppText>
        </View>
      </View>

      {statusText ? (
        <AppText style={styles.statusText}>{statusText}</AppText>
      ) : (
        <TouchableOpacity
          style={[styles.redeemBtn, disabled && styles.redeemBtnDisabled]}
          onPress={() => onRedeem(reward)}
          disabled={disabled}
          activeOpacity={0.85}
        >
          {redeeming ? (
            <ActivityIndicator size="small" color={colors.midnight[950]} />
          ) : (
            <AppText style={styles.redeemBtnText}>Canjear</AppText>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Sección por nivel ──────────────────────────────────────────────────────
function LevelSection({ section, onRedeem, redeemingId }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View
          style={[
            styles.sectionBadge,
            section.unlocked && styles.sectionBadgeUnlocked,
          ]}
        >
          {section.unlocked ? (
            <Award size={14} color={colors.midnight[950]} />
          ) : (
            <Lock size={13} color={colors.textSecondary} />
          )}
        </View>
        <AppText style={styles.sectionTitle}>
          {section.level.name || `Nivel ${section.level.id}`}
        </AppText>
        {!section.unlocked && (
          <AppText style={styles.sectionLockedTag}>Bloqueado</AppText>
        )}
      </View>

      {section.rewards.map((reward) => (
        <RewardCard
          key={reward.id}
          reward={reward}
          onRedeem={onRedeem}
          redeeming={redeemingId === reward.id}
        />
      ))}
    </View>
  );
}

// ─── Modal del vale (código + QR) ──────────────────────────────────────────
function VoucherModal({ visible, result, onClose }) {
  if (!result) return null;
  const voucher = result.vouchers?.[0] || null;
  const isVoucherType =
    result.reward_type === 'BLANK_TICKET' || result.reward_type === 'TWO_FOR_ONE';
  const qrValue = isVoucherType ? voucher?.code : result.receipt_qr;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.voucherOverlay}>
        <View style={styles.voucherCard}>
          <TouchableOpacity style={styles.voucherClose} onPress={onClose}>
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.voucherIconWrap}>
            <Sparkles size={26} color={colors.midnight[950]} />
          </View>
          <AppText style={styles.voucherTitle}>¡Canje exitoso!</AppText>
          <AppText style={styles.voucherSubtitle}>
            {isVoucherType
              ? 'Presenta este código en taquilla para hacerlo válido.'
              : 'Presenta este QR en taquilla para retirar tu producto.'}
          </AppText>

          {!!qrValue && (
            <View style={styles.qrWrap}>
              <QRCode value={String(qrValue)} size={170} />
            </View>
          )}

          {isVoucherType && voucher?.code && (
            <View style={styles.codeBox}>
              <AppText style={styles.codeText}>{voucher.code}</AppText>
            </View>
          )}

          {isVoucherType && voucher?.expires_at && (
            <AppText style={styles.voucherExpiry}>
              Válido hasta{' '}
              {new Date(voucher.expires_at).toLocaleDateString('es-VE')}
            </AppText>
          )}

          <View style={styles.voucherBalanceRow}>
            <AppText style={styles.voucherBalanceLabel}>Saldo restante</AppText>
            <AppText style={styles.voucherBalanceValue}>
              {Number(result.new_balance).toLocaleString('es-VE')} pts
            </AppText>
          </View>

          <TouchableOpacity style={styles.voucherDoneBtn} onPress={onClose}>
            <AppText style={styles.voucherDoneBtnText}>Listo</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Pantalla principal ─────────────────────────────────────────────────────
export default function RewardsScreen() {
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [cinemas, setCinemas] = useState([]);
  const [cinemaModalVisible, setCinemaModalVisible] = useState(false);
  const [loadingCinemas, setLoadingCinemas] = useState(false);

  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const [redeemingId, setRedeemingId] = useState(null);
  const [voucherResult, setVoucherResult] = useState(null);

  // El cliente elige su sucursal explícitamente (mismo patrón que Confitería):
  // no se asume la del carrito ni "la primera" en automático.
  const openCinemaPicker = useCallback(async () => {
    setLoadingCinemas(true);
    try {
      const response = await getCinemas();
      const list = Array.isArray(response) ? response : response?.data ?? [];
      setCinemas(list);
      setCinemaModalVisible(true);
    } catch (e) {
      setError(true);
    } finally {
      setLoadingCinemas(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!selectedCinema) openCinemaPicker();
    }, [selectedCinema, openCinemaPicker])
  );

  const fetchCatalog = useCallback(
    async (isRefresh = false) => {
      if (!selectedCinema) return;
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(false);
      try {
        const data = await loyaltyRewardsService.getAvailable(selectedCinema.id);
        setCatalog(data);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCinema]
  );

  useFocusEffect(
    useCallback(() => {
      if (selectedCinema) fetchCatalog(false);
    }, [selectedCinema, fetchCatalog])
  );

  const handleSelectCinema = (cinema) => {
    setSelectedCinema(cinema);
    setCinemaModalVisible(false);
  };

  const handleRedeem = async (reward) => {
    if (!selectedCinema) return;
    setRedeemingId(reward.id);
    try {
      const result = await loyaltyRewardsService.redeem(
        reward.id,
        selectedCinema.id
      );
      setVoucherResult({ ...result, reward_type: reward.reward_type });
      fetchCatalog(true);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        'No pudimos completar el canje. Intenta de nuevo.';
      setError(msg);
    } finally {
      setRedeemingId(null);
    }
  };

  const sections = catalog?.sections ?? [];
  const pointsBalance = catalog?.customer?.points_balance ?? 0;

  return (
    <ScreenWrapper disableSafeArea={false}>
      <View style={styles.topBar}>
        <AppText style={styles.topBarTitle}>Premios</AppText>
      </View>

      {/* Selector de sucursal (siempre visible, como en Confitería) */}
      <TouchableOpacity
        style={styles.cinemaBar}
        onPress={openCinemaPicker}
        activeOpacity={0.8}
      >
        <MapPin size={16} color={colors.primary} />
        <AppText style={styles.cinemaBarText} numberOfLines={1}>
          {selectedCinema ? selectedCinema.name : 'Elige tu sucursal'}
        </AppText>
        <ChevronRight size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      {!selectedCinema ? (
        <View style={styles.center}>
          {loadingCinemas ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <Gift size={32} color={colors.textSecondary} />
              <AppText style={styles.emptyText}>
                Elige una sucursal para ver sus premios disponibles.
              </AppText>
              <TouchableOpacity style={styles.retryBtn} onPress={openCinemaPicker}>
                <AppText style={styles.retryBtnText}>Elegir sucursal</AppText>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <AppText style={styles.errorText}>
            {typeof error === 'string' ? error : 'No pudimos cargar los premios.'}
          </AppText>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchCatalog(false)}>
            <AppText style={styles.retryBtnText}>Reintentar</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchCatalog(true)}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.balanceRow}>
            <Star size={16} color={colors.primary} fill={colors.primary} />
            <AppText style={styles.balanceText}>
              Tu saldo:{' '}
              <AppText style={styles.balanceValue}>
                {Number(pointsBalance).toLocaleString('es-VE')} pts
              </AppText>
            </AppText>
          </View>

          {sections.length === 0 ? (
            <View style={styles.center}>
              <AppText style={styles.emptyText}>
                No hay premios disponibles en esta sucursal por ahora.
              </AppText>
            </View>
          ) : (
            sections.map((section) => (
              <LevelSection
                key={section.level.id}
                section={section}
                onRedeem={handleRedeem}
                redeemingId={redeemingId}
              />
            ))
          )}
        </ScrollView>
      )}

      {/* Modal de selección de sucursal */}
      <Modal visible={cinemaModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>Elige tu sucursal</AppText>
              <TouchableOpacity onPress={() => setCinemaModalVisible(false)}>
                <X size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={cinemas}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cinemaOption}
                  onPress={() => handleSelectCinema(item)}
                >
                  <AppText style={styles.cinemaName}>{item.name}</AppText>
                  {!!item.address && (
                    <AppText style={styles.cinemaAddress}>{item.address}</AppText>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <VoucherModal
        visible={!!voucherResult}
        result={voucherResult}
        onClose={() => setVoucherResult(null)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: spacing.s16,
    paddingTop: spacing.s12,
    paddingBottom: spacing.s4,
  },
  topBarTitle: {
    color: colors.primary,
    fontSize: 22,
    fontFamily: theme.typography.family.primary.bold,
  },
  cinemaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s8,
    marginHorizontal: spacing.s16,
    marginBottom: spacing.s12,
    paddingHorizontal: spacing.s12,
    paddingVertical: 10,
    backgroundColor: colors.midnight[800],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  cinemaBarText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: theme.typography.family.primary.bold,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.s16,
    paddingHorizontal: spacing.s24,
    paddingVertical: spacing.s32,
  },
  errorText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
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
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s8,
    backgroundColor: 'rgba(246,173,56,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(246,173,56,0.3)',
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s12,
    borderRadius: borderRadius.s16,
  },
  balanceText: { color: colors.textSecondary, fontSize: 13 },
  balanceValue: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
  },
  section: { gap: spacing.s12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s8,
  },
  sectionBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.midnight[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBadgeUnlocked: { backgroundColor: colors.primary },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: theme.typography.family.primary.bold,
  },
  sectionLockedTag: {
    color: colors.textSecondary,
    fontSize: 11,
    backgroundColor: colors.midnight[800],
    paddingHorizontal: spacing.s8,
    paddingVertical: 2,
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    padding: spacing.s16,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    gap: spacing.s12,
  },
  cardLocked: { opacity: 0.6 },
  cardTop: { flexDirection: 'row', gap: spacing.s12 },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTexts: { flex: 1, gap: 2 },
  cardName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: theme.typography.family.primary.bold,
  },
  cardDesc: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  cardFooter: { flexDirection: 'row', gap: spacing.s8 },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(246,173,56,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(246,173,56,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pointsBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: theme.typography.family.primary.bold,
  },
  typeBadge: {
    backgroundColor: colors.midnight[700],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  typeBadgeText: { color: colors.textSecondary, fontSize: 11 },
  statusText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  redeemBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: borderRadius.s8,
    alignItems: 'center',
  },
  redeemBtnDisabled: { opacity: 0.5 },
  redeemBtnText: {
    color: colors.midnight[950],
    fontFamily: theme.typography.family.primary.bold,
  },
  // Modal selector de sucursal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.midnight[900],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: spacing.s24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.s16,
    borderBottomWidth: 1,
    borderBottomColor: colors.midnight[700],
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: theme.typography.family.primary.bold,
  },
  cinemaOption: {
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s16,
    borderBottomWidth: 1,
    borderBottomColor: colors.midnight[800],
  },
  cinemaName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: theme.typography.family.primary.bold,
  },
  cinemaAddress: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  // Modal del vale
  voucherOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.s24,
  },
  voucherCard: {
    width: '100%',
    backgroundColor: colors.midnight[900],
    borderRadius: borderRadius.s16,
    padding: spacing.s24,
    alignItems: 'center',
    gap: spacing.s12,
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  voucherClose: { position: 'absolute', top: spacing.s16, right: spacing.s16 },
  voucherIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voucherTitle: {
    color: colors.primary,
    fontSize: 18,
    fontFamily: theme.typography.family.primary.bold,
  },
  voucherSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  qrWrap: {
    backgroundColor: '#fff',
    padding: spacing.s16,
    borderRadius: borderRadius.s16,
    marginVertical: spacing.s8,
  },
  codeBox: {
    backgroundColor: colors.midnight[800],
    borderWidth: 1,
    borderColor: colors.midnight[700],
    borderRadius: borderRadius.s8,
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s8,
  },
  codeText: {
    color: colors.primary,
    fontSize: 18,
    letterSpacing: 2,
    fontFamily: theme.typography.family.primary.bold,
  },
  voucherExpiry: { color: colors.textSecondary, fontSize: 12 },
  voucherBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: spacing.s12,
    borderTopWidth: 1,
    borderTopColor: colors.midnight[700],
  },
  voucherBalanceLabel: { color: colors.textSecondary, fontSize: 13 },
  voucherBalanceValue: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: theme.typography.family.primary.bold,
  },
  voucherDoneBtn: {
    marginTop: spacing.s8,
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.s12,
    borderRadius: borderRadius.s8,
    alignItems: 'center',
  },
  voucherDoneBtnText: {
    color: colors.midnight[950],
    fontFamily: theme.typography.family.primary.bold,
  },
});
