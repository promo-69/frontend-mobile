import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Check, ChevronLeft, Gift, Lock, Ticket, X } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { AppText } from '../../../../components/ui/AppText';
import { ScreenWrapper } from '../../../../components/ui/ScreenWrapper';
import { theme } from '../../../../constants';
import { useCart } from '../../../../context/CartContext';
import { getCinemas } from '../../../../services/cinemas.service';
import { loyaltyRewardsService } from '../../../../services/loyalty-rewards.service';
import { appAlert } from '../../../../context/AlertContext';

const { colors, spacing, borderRadius, typography } = theme;

const TYPE_LABELS = {
  PRODUCT: 'Producto',
  COMBO: 'Combo',
  BLANK_TICKET: 'Boleto en blanco',
  TWO_FOR_ONE: '2x1 en entradas',
};

function extractRows(payload) {
  const raw = payload?.data ?? payload;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.rows)) return raw.rows;
  return [];
}

function RewardCard({ reward, onRedeem, redeeming }) {
  const claimable = !!reward.claimable;
  return (
    <View style={[styles.rewardCard, !claimable && styles.rewardCardLocked]}>
      <View style={styles.rewardIcon}>
        {reward.reward_type === 'BLANK_TICKET' || reward.reward_type === 'TWO_FOR_ONE' ? (
          <Ticket size={20} color={colors.primary} />
        ) : (
          <Gift size={20} color={colors.primary} />
        )}
      </View>
      <View style={styles.rewardBody}>
        <AppText style={styles.rewardName}>{reward.name}</AppText>
        <View style={styles.rewardMetaRow}>
          <View style={styles.typeBadge}>
            <AppText style={styles.typeBadgeText}>
              {TYPE_LABELS[reward.reward_type] ?? reward.reward_type}
            </AppText>
          </View>
          <AppText style={styles.rewardCost}>
            {Number(reward.points_cost).toLocaleString('es-VE')} pts
          </AppText>
        </View>
        {!reward.unlocked ? (
          <AppText style={styles.rewardHintLocked}>Sube de nivel para desbloquearlo</AppText>
        ) : !reward.affordable ? (
          <AppText style={styles.rewardHintLocked}>Puntos insuficientes</AppText>
        ) : null}
      </View>
      <TouchableOpacity
        style={[styles.redeemBtn, !claimable && styles.redeemBtnDisabled]}
        disabled={!claimable || redeeming}
        onPress={() => onRedeem(reward)}
      >
        {reward.unlocked ? (
          <AppText style={styles.redeemBtnText}>Canjear</AppText>
        ) : (
          <Lock size={16} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function LoyaltyCatalogScreen() {
  const router = useRouter();
  const { cart } = useCart();

  const [cinemas, setCinemas] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState(cart?.cinemaId ?? null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [catalog, setCatalog] = useState(null);

  const [redeeming, setRedeeming] = useState(false);
  const [voucher, setVoucher] = useState(null); // { reward, result }

  // Cargar sucursales una vez
  useEffect(() => {
    (async () => {
      try {
        const list = extractRows(await getCinemas({ limit: 1000 }));
        setCinemas(list);
        if (!selectedCinema && list.length > 0) setSelectedCinema(list[0].id);
      } catch {
        setCinemas([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCatalog = useCallback(async () => {
    if (!selectedCinema) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const result = await loyaltyRewardsService.getAvailable(selectedCinema);
      setCatalog(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [selectedCinema]);

  useFocusEffect(
    useCallback(() => {
      loadCatalog();
    }, [loadCatalog])
  );

  const confirmRedeem = (reward) => {
    appAlert(
      'Canjear premio',
      `¿Canjear "${reward.name}" por ${Number(reward.points_cost).toLocaleString('es-VE')} CinePuntos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Canjear', onPress: () => doRedeem(reward) },
      ]
    );
  };

  const doRedeem = async (reward) => {
    setRedeeming(true);
    try {
      const result = await loyaltyRewardsService.redeem(reward.id, selectedCinema);
      setVoucher({ reward, result });
      await loadCatalog(); // refrescar saldo y disponibilidad
    } catch (e) {
      const msg = e?.response?.data?.message || 'No se pudo completar el canje.';
      appAlert('Error', msg);
    } finally {
      setRedeeming(false);
    }
  };

  const balance = catalog?.customer?.points_balance ?? 0;
  const sections = catalog?.sections ?? [];

  return (
    <ScreenWrapper>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={26} color={colors.primary} />
        </TouchableOpacity>
        <AppText style={styles.topBarTitle}>Premios canjeables</AppText>
        <View style={{ width: 26 }} />
      </View>

      {/* Selector de sucursal */}
      {cinemas.length > 0 && (
        <View style={styles.cinemaBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cinemaBarContent}>
            {cinemas.map((c) => {
              const active = c.id === selectedCinema;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.cinemaChip, active && styles.cinemaChipActive]}
                  onPress={() => setSelectedCinema(c.id)}
                >
                  <AppText style={[styles.cinemaChipText, active && styles.cinemaChipTextActive]}>
                    {c.name || c.description}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Saldo */}
      <View style={styles.balancePill}>
        <AppText style={styles.balanceLabel}>Tu saldo</AppText>
        <AppText style={styles.balanceValue}>
          {Number(balance).toLocaleString('es-VE')} CinePuntos
        </AppText>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <AppText style={styles.errorText}>No pudimos cargar los premios.</AppText>
          <TouchableOpacity style={styles.retryBtn} onPress={loadCatalog}>
            <AppText style={styles.retryBtnText}>Reintentar</AppText>
          </TouchableOpacity>
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.center}>
          <AppText style={styles.emptyText}>
            No hay premios disponibles en esta sucursal por ahora.
          </AppText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {sections.map((section) => (
            <View key={section.level.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <AppText style={styles.sectionTitle}>{section.level.name}</AppText>
                {!section.unlocked && (
                  <View style={styles.lockedTag}>
                    <Lock size={12} color={colors.textSecondary} />
                    <AppText style={styles.lockedTagText}>Bloqueado</AppText>
                  </View>
                )}
              </View>
              {section.rewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  redeeming={redeeming}
                  onRedeem={confirmRedeem}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Modal del vale / recibo */}
      <VoucherModal voucher={voucher} onClose={() => setVoucher(null)} />
    </ScreenWrapper>
  );
}

function VoucherModal({ voucher, onClose }) {
  if (!voucher) return null;
  const { reward, result } = voucher;
  const vouchers = result?.vouchers ?? [];
  const isTicket = vouchers.length > 0;
  const qrValue = isTicket ? vouchers[0].code : result?.receipt_qr;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
            <X size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.successIcon}>
            <Check size={26} color={colors.midnight[950]} />
          </View>
          <AppText style={styles.modalTitle}>¡Canje exitoso!</AppText>
          <AppText style={styles.modalSubtitle}>{reward.name}</AppText>

          {qrValue ? (
            <View style={styles.qrBox}>
              <QRCode value={String(qrValue)} size={180} />
            </View>
          ) : (
            <AppText style={styles.emptyText}>Revisa tu correo para el comprobante.</AppText>
          )}

          {isTicket ? (
            <>
              <AppText style={styles.voucherCode}>{vouchers[0].code}</AppText>
              {vouchers.length > 1 && (
                <AppText style={styles.modalHint}>
                  +{vouchers.length - 1} vale(s) adicional(es) en tu correo y compras.
                </AppText>
              )}
              <AppText style={styles.modalHint}>
                Muestra este código/QR en taquilla para tu función. Válido 30 días.
              </AppText>
            </>
          ) : (
            <AppText style={styles.modalHint}>
              Muestra este QR en taquilla para retirar tu premio.
            </AppText>
          )}

          <View style={styles.balanceAfter}>
            <AppText style={styles.balanceAfterText}>
              Saldo restante: {Number(result?.new_balance ?? 0).toLocaleString('es-VE')} CinePuntos
            </AppText>
          </View>

          <TouchableOpacity style={styles.modalDoneBtn} onPress={onClose}>
            <AppText style={styles.modalDoneBtnText}>Listo</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    fontFamily: typography.family.primary.bold,
  },
  cinemaBar: { paddingBottom: spacing.s8 },
  cinemaBarContent: { paddingHorizontal: spacing.s16, gap: spacing.s8 },
  cinemaChip: {
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s8,
    borderRadius: 20,
    backgroundColor: colors.midnight[800],
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  cinemaChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  cinemaChipText: { color: colors.textSecondary, fontSize: 13 },
  cinemaChipTextActive: {
    color: colors.midnight[950],
    fontFamily: typography.family.primary.bold,
  },
  balancePill: {
    marginHorizontal: spacing.s16,
    marginBottom: spacing.s12,
    padding: spacing.s16,
    borderRadius: borderRadius.s16,
    backgroundColor: colors.midnight[900],
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLabel: { color: colors.textSecondary, fontSize: 13 },
  balanceValue: {
    color: colors.primary,
    fontSize: 16,
    fontFamily: typography.family.primary.bold,
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
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.s24,
    paddingVertical: spacing.s12,
    borderRadius: borderRadius.s8,
  },
  retryBtnText: {
    color: colors.midnight[950],
    fontFamily: typography.family.primary.bold,
  },
  scroll: { paddingHorizontal: spacing.s16, paddingBottom: spacing.s32, gap: spacing.s16 },
  section: { gap: spacing.s8 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.s8,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: typography.family.primary.bold,
  },
  lockedTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lockedTagText: { color: colors.textSecondary, fontSize: 11 },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s12,
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    padding: spacing.s12,
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  rewardCardLocked: { opacity: 0.6 },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(246,173,56,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardBody: { flex: 1, gap: 4 },
  rewardName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.family.primary.bold,
  },
  rewardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s8 },
  typeBadge: {
    backgroundColor: colors.midnight[700],
    paddingHorizontal: spacing.s8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: { color: colors.textSecondary, fontSize: 10 },
  rewardCost: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: typography.family.primary.bold,
  },
  rewardHintLocked: { color: colors.textSecondary, fontSize: 11 },
  redeemBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s8,
    borderRadius: borderRadius.s8,
    minWidth: 56,
    alignItems: 'center',
  },
  redeemBtnDisabled: { backgroundColor: colors.midnight[700] },
  redeemBtnText: {
    color: colors.midnight[950],
    fontSize: 13,
    fontFamily: typography.family.primary.bold,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.s24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.midnight[900],
    borderRadius: borderRadius.s16,
    padding: spacing.s24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  modalClose: { position: 'absolute', top: spacing.s12, right: spacing.s12, padding: 4 },
  successIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s12,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: typography.family.primary.bold,
  },
  modalSubtitle: { color: colors.textSecondary, fontSize: 13, marginBottom: spacing.s16 },
  qrBox: {
    backgroundColor: '#fff',
    padding: spacing.s16,
    borderRadius: borderRadius.s8,
    marginBottom: spacing.s12,
  },
  voucherCode: {
    color: colors.primary,
    fontSize: 20,
    letterSpacing: 3,
    fontFamily: typography.family.primary.bold,
    marginBottom: spacing.s8,
  },
  modalHint: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: spacing.s4,
  },
  balanceAfter: { marginTop: spacing.s12, marginBottom: spacing.s16 },
  balanceAfterText: {
    color: colors.gold[200],
    fontSize: 13,
    fontFamily: typography.family.primary.bold,
  },
  modalDoneBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.s32,
    paddingVertical: spacing.s12,
    borderRadius: borderRadius.s8,
    width: '100%',
    alignItems: 'center',
  },
  modalDoneBtnText: {
    color: colors.midnight[950],
    fontFamily: typography.family.primary.bold,
    fontSize: 15,
  },
});
