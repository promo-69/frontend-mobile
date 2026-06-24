import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../../components/AppText';
import { useCart } from '../../../context/CartContext';
import { registerPayment } from '../../../services/orders.service';
import { usersService } from '../../../services/users.service';
import { theme } from '../../../constants';

const { colors, spacing, borderRadius } = theme;

const USD_CURRENCY_ID = 1;

const fmtVes = (n) =>
  `Bs. ${Number(n || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtUsd = (n) => `$${Number(n || 0).toFixed(2)}`;

const METHODS = [
  { key: 'mobile_payment', label: 'Pago Móvil', icon: '📱' },
  { key: 'transfer', label: 'Transferencia', icon: '🏦' },
  { key: 'points', label: 'Cine Puntos', icon: '🎟️' },
];

// IDs de método de pago que espera el backend (PAYMENT_METHOD en magic-vars).
// CASH:1, POS:2, MOBILE_PAYMENT:3, BANK_TRANSFER:4, LOYALTY_POINTS:5
const PAYMENT_METHOD_ID = {
  mobile_payment: 3,
  transfer: 4,
  points: 5,
};

const BANK_INFO = {
  bank: 'Banco Mercantil',
  account: '0105-0000-00-0000000000',
  rif: 'J-12345678-9',
};

// ─── Formularios (sin cambios) ──────────────────────────────────────────────
function MobilePaymentForm({ data, onChange }) {
  return (
    <View style={styles.formSection}>
      <View style={styles.bankCard}>
        <AppText variant="caption" style={styles.bankCardLabel}>
          DATOS DE PAGO
        </AppText>
        <AppText variant="smallText" style={styles.bankCardField}>
          <AppText style={styles.bankFieldKey}>Banco: </AppText>
          {BANK_INFO.bank}
        </AppText>
        <AppText variant="smallText" style={styles.bankCardField}>
          <AppText style={styles.bankFieldKey}>Cuenta: </AppText>
          {BANK_INFO.account}
        </AppText>
        <AppText variant="smallText" style={styles.bankCardField}>
          <AppText style={styles.bankFieldKey}>RIF: </AppText>
          {BANK_INFO.rif}
        </AppText>
      </View>
      <AppText variant="caption" style={styles.formLabel}>
        DETALLES DE LA OPERACIÓN
      </AppText>
      <FormField
        label="Banco de origen"
        placeholder="Ej: Banco de Venezuela"
        value={data.bank}
        onChangeText={(v) => onChange({ ...data, bank: v })}
      />
      <FormField
        label="Número de referencia"
        placeholder="Ej: 12345678"
        value={data.reference}
        onChangeText={(v) => onChange({ ...data, reference: v })}
        keyboardType="numeric"
      />
      <FormField
        label="Teléfono emisor"
        placeholder="Ej: 04121234567"
        value={data.phone}
        onChangeText={(v) => onChange({ ...data, phone: v })}
        keyboardType="phone-pad"
      />
    </View>
  );
}

function TransferForm({ data, onChange }) {
  return (
    <View style={styles.formSection}>
      <View style={styles.bankCard}>
        <AppText variant="caption" style={styles.bankCardLabel}>
          DATOS DE PAGO
        </AppText>
        <AppText variant="smallText" style={styles.bankCardField}>
          <AppText style={styles.bankFieldKey}>Banco: </AppText>
          {BANK_INFO.bank}
        </AppText>
        <AppText variant="smallText" style={styles.bankCardField}>
          <AppText style={styles.bankFieldKey}>Cuenta: </AppText>
          {BANK_INFO.account}
        </AppText>
        <AppText variant="smallText" style={styles.bankCardField}>
          <AppText style={styles.bankFieldKey}>RIF: </AppText>
          {BANK_INFO.rif}
        </AppText>
      </View>
      <AppText variant="caption" style={styles.formLabel}>
        DETALLES DE LA OPERACIÓN
      </AppText>
      <FormField
        label="Banco de origen"
        placeholder="Seleccionar banco..."
        value={data.bank}
        onChangeText={(v) => onChange({ ...data, bank: v })}
      />
      <FormField
        label="Número de referencia"
        placeholder="Ej: 12345678"
        value={data.reference}
        onChangeText={(v) => onChange({ ...data, reference: v })}
        keyboardType="numeric"
      />
      <FormField
        label="Fecha de transferencia"
        placeholder="mm/dd/aaaa"
        value={data.date}
        onChangeText={(v) => onChange({ ...data, date: v })}
      />
      <FormField
        label="Nombre del titular"
        placeholder="Nombre completo"
        value={data.holder}
        onChangeText={(v) => onChange({ ...data, holder: v })}
      />
    </View>
  );
}

function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
}) {
  return (
    <View style={styles.fieldWrapper}>
      <AppText variant="caption" style={styles.fieldLabel}>
        {label}
      </AppText>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

function CinePuntosForm({
  pointsBalance,
  loadingPoints,
  pointsToRedeem,
  onChangePoints,
  totalVes,
  exchangeRates,
}) {
  const maxRedeemable = Math.min(pointsBalance, Math.round(totalVes));
  const entered = Number(pointsToRedeem) || 0;
  const remaining = Math.max(0, totalVes - entered);

  const usdRate = exchangeRates?.[USD_CURRENCY_ID]?.rate;
  const pointsInUsd =
    usdRate && pointsBalance ? (pointsBalance / usdRate).toFixed(2) : null;

  return (
    <View style={styles.bankCard}>
      <AppText variant="caption" style={styles.bankCardLabel}>
        CANJEAR CINE PUNTOS
      </AppText>
      <View style={styles.pointsBalanceRow}>
        {loadingPoints ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <View>
            <AppText style={styles.pointsBalanceMain}>
              {pointsBalance.toLocaleString('es-VE')} pts disponibles
            </AppText>
            {pointsInUsd && (
              <AppText style={styles.pointsBalanceSub}>
                ≈ {fmtUsd(pointsInUsd)}
              </AppText>
            )}
          </View>
        )}
      </View>
      <View style={styles.fieldWrapper}>
        <AppText style={styles.fieldLabel}>Puntos a utilizar</AppText>
        <TextInput
          style={styles.redeemInput}
          placeholder={`Máx. ${maxRedeemable.toLocaleString('es-VE')}`}
          placeholderTextColor={colors.midnight[400]}
          keyboardType="numeric"
          value={pointsToRedeem}
          onChangeText={(v) => {
            const num = Number(v) || 0;
            if (num > maxRedeemable) {
              onChangePoints(String(maxRedeemable));
            } else {
              onChangePoints(v);
            }
          }}
        />
        {entered > 0 && (
          <AppText style={styles.estimateNote}>
            Cubre {fmtVes(entered)} · Restante: {fmtVes(remaining)}
          </AppText>
        )}
      </View>
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function PaymentScreen() {
  const router = useRouter();
  const {
    total,
    currency: currencyParam,
    exchange_rates: exchangeRatesParam,
    expiresAt: expiresAtParam,
  } = useLocalSearchParams();
  const { clearCart } = useCart();
  const insets = useSafeAreaInsets();

  const totalVes = Number(total || 0);
  const currency = Number(currencyParam || 2);

  const exchangeRates = (() => {
    try {
      return exchangeRatesParam ? JSON.parse(exchangeRatesParam) : {};
    } catch {
      return {};
    }
  })();

  const usdRate = exchangeRates?.[USD_CURRENCY_ID]?.rate;
  const totalUsd = usdRate ? totalVes / usdRate : null;

  // ─── Timer sincronizado ──────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(null); // null = no inicializado
  const intervalRef = useRef(null);
  const alertShownRef = useRef(false);

  useEffect(() => {
    if (!expiresAtParam) return;

    const expiresAt = Number(expiresAtParam);
    const now = Date.now();
    const initial = Math.floor((expiresAt - now) / 1000);

    if (initial > 0) {
      setTimeLeft(initial);
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Ya expiró al montar
      setTimeLeft(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [expiresAtParam]);

  // Alerta de expiración: solo se ejecuta cuando timeLeft es 0 y no es null
  useEffect(() => {
    if (timeLeft === 0 && timeLeft !== null && !alertShownRef.current) {
      alertShownRef.current = true;
      Alert.alert(
        'Sesión expirada',
        'Tu tiempo para pagar ha terminado. Vuelve a intentarlo.',
        [
          {
            text: 'Entendido',
            onPress: () => {
              alertShownRef.current = false;
              clearCart();
              router.back();
            },
          },
        ]
      );
    }
  }, [timeLeft, router, clearCart]);

  // ─── Puntos y métodos ────────────────────────────────────────────────────────
  const [pointsBalance, setPointsBalance] = useState(0);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [formData, setFormData] = useState({
    bank: '',
    reference: '',
    phone: '',
    date: '',
    holder: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedMethod !== 'points') return;
    let cancelled = false;
    setLoadingPoints(true);
    usersService
      .getLoyaltyInfo()
      .then((data) => {
        if (!cancelled) setPointsBalance(data?.points_balance ?? 0);
      })
      .catch(() => {
        if (!cancelled) setPointsBalance(0);
      })
      .finally(() => {
        if (!cancelled) setLoadingPoints(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedMethod]);

  const selectMethod = (key) => {
    setSelectedMethod(key);
    setPointsToRedeem('');
    setFormData({ bank: '', reference: '', phone: '', date: '', holder: '' });
  };

  const validate = () => {
    if (!selectedMethod) {
      Alert.alert('Método requerido', 'Selecciona un método de pago.');
      return false;
    }
    if (selectedMethod === 'mobile_payment') {
      if (!formData.bank.trim()) {
        Alert.alert('Campo requerido', 'Ingresa el banco de origen.');
        return false;
      }
      if (!formData.reference.trim()) {
        Alert.alert('Campo requerido', 'Ingresa el número de referencia.');
        return false;
      }
      if (!formData.phone.trim()) {
        Alert.alert('Campo requerido', 'Ingresa el teléfono emisor.');
        return false;
      }
    }
    if (selectedMethod === 'transfer') {
      if (!formData.bank.trim()) {
        Alert.alert('Campo requerido', 'Ingresa el banco de origen.');
        return false;
      }
      if (!formData.reference.trim()) {
        Alert.alert('Campo requerido', 'Ingresa el número de referencia.');
        return false;
      }
      if (!formData.date.trim()) {
        Alert.alert('Campo requerido', 'Ingresa la fecha de transferencia.');
        return false;
      }
    }
    if (selectedMethod === 'points') {
      const pts = Number(pointsToRedeem) || 0;
      if (pts <= 0) {
        Alert.alert(
          'Puntos requeridos',
          'Ingresa la cantidad de puntos a canjear.'
        );
        return false;
      }
      if (pts > pointsBalance) {
        Alert.alert(
          'Saldo insuficiente',
          `Solo tienes ${pointsBalance.toLocaleString('es-VE')} puntos disponibles.`
        );
        return false;
      }
    }
    return true;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const pointsAmount = Number(pointsToRedeem) || 0;
      const payload = {
        payment_method: PAYMENT_METHOD_ID[selectedMethod] ?? selectedMethod,
        amount: selectedMethod === 'points' ? pointsAmount : totalVes,
        currency,
        ...(formData.reference.trim()
          ? { reference_number: formData.reference.trim() }
          : {}),
        ...(formData.bank.trim() ? { bank: formData.bank.trim() } : {}),
        ...(formData.phone.trim() ? { phone: formData.phone.trim() } : {}),
        ...(formData.date.trim()
          ? { transfer_date: formData.date.trim() }
          : {}),
        ...(formData.holder.trim()
          ? { account_holder: formData.holder.trim() }
          : {}),
      };

      const orderData = await registerPayment(payload);
      const qrCode = orderData?.qr_code ?? orderData?.data?.qr_code ?? '';

      await clearCart();
      const method = METHODS.find((m) => m.key === selectedMethod);
      router.replace({
        pathname: '/(buy)/order-success',
        params: {
          qrCode,
          total: String(totalVes),
          paymentMethod: method?.label ?? '',
          isPoints: selectedMethod === 'points' ? '1' : '0',
          pointsUsed:
            selectedMethod === 'points'
              ? String(Number(pointsToRedeem) || 0)
              : '0',
        },
      });
    } catch (err) {
      console.error('Error registrando pago:', err);
      Alert.alert(
        'Error en el pago',
        err?.response?.data?.message ||
          'No se pudo procesar el pago. Verifica e intenta de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const bottomBarHeight = 56 + 16 + 16 + insets.bottom;
  const timerExpired = timeLeft === 0 && timeLeft !== null;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        {...theme.colors.gradients.bgColor}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: bottomBarHeight + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Timer ── */}
        {expiresAtParam && timeLeft !== null && (
          <View
            style={[
              styles.timerBanner,
              timerExpired && styles.timerBannerExpired,
            ]}
          >
            <AppText style={styles.timerText}>
              {timerExpired
                ? '⛔ Sesión expirada'
                : `⏱ Tiempo restante: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`}
            </AppText>
          </View>
        )}

        {/* ── Total ── */}
        <View style={styles.totalCard}>
          <AppText variant="caption" style={styles.totalLabel}>
            Total a pagar
          </AppText>
          <AppText style={styles.totalAmountVes}>{fmtVes(totalVes)}</AppText>
          {totalUsd !== null && (
            <AppText style={styles.totalAmountUsd}>{fmtUsd(totalUsd)}</AppText>
          )}
          <AppText style={styles.totalPoints}>
            ≈ {Math.round(totalVes).toLocaleString('es-VE')} pts
          </AppText>
        </View>

        {/* ── Métodos de pago ── */}
        <AppText variant="caption" style={styles.sectionLabel}>
          MÉTODO DE PAGO
        </AppText>
        <View style={styles.methodsRow}>
          {METHODS.map((m) => {
            const active = selectedMethod === m.key;
            return (
              <TouchableOpacity
                key={m.key}
                style={[styles.methodBtn, active && styles.methodBtnActive]}
                onPress={() => selectMethod(m.key)}
                activeOpacity={0.8}
              >
                <AppText style={styles.methodIcon}>{m.icon}</AppText>
                <AppText
                  variant="caption"
                  style={[
                    styles.methodBtnLabel,
                    active && styles.methodBtnLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {m.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Formularios dinámicos ── */}
        {selectedMethod === 'mobile_payment' && (
          <MobilePaymentForm data={formData} onChange={setFormData} />
        )}
        {selectedMethod === 'transfer' && (
          <TransferForm data={formData} onChange={setFormData} />
        )}
        {selectedMethod === 'points' && (
          <CinePuntosForm
            pointsBalance={pointsBalance}
            loadingPoints={loadingPoints}
            pointsToRedeem={pointsToRedeem}
            onChangePoints={setPointsToRedeem}
            totalVes={totalVes}
            exchangeRates={exchangeRates}
          />
        )}
      </ScrollView>

      {/* ── Botón inferior ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity
          style={[
            styles.payBtn,
            (!selectedMethod || submitting || timerExpired) &&
              styles.payBtnDisabled,
          ]}
          onPress={handlePay}
          disabled={!selectedMethod || submitting || timerExpired}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color={colors.midnight[950]} />
          ) : (
            <AppText variant="button" style={styles.payBtnText}>
              {timerExpired
                ? 'Sesión expirada'
                : `Confirmar pago · ${fmtVes(totalVes)}`}
            </AppText>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Estilos (sin cambios) ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.s16,
    paddingTop: spacing.s16,
    gap: spacing.s16,
  },

  timerBanner: {
    backgroundColor: colors.midnight[800],
    paddingVertical: spacing.s8,
    paddingHorizontal: spacing.s16,
    borderRadius: borderRadius.s8,
    marginBottom: spacing.s4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  timerBannerExpired: { backgroundColor: '#7B1A22' },
  timerText: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 13,
    letterSpacing: 0.5,
  },

  totalCard: {
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    paddingVertical: spacing.s16,
    paddingHorizontal: spacing.s16,
    alignItems: 'center',
    gap: spacing.s4,
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  totalLabel: { color: colors.textSecondary, letterSpacing: 0.5 },
  totalAmountVes: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 32,
  },
  totalAmountUsd: {
    color: colors.textSecondary,
    fontFamily: theme.typography.family.primary.regular,
    fontSize: 14,
    marginTop: 2,
  },
  totalPoints: {
    color: colors.gold[400],
    fontFamily: theme.typography.family.primary.regular,
    fontSize: 14,
    marginTop: 2,
  },

  sectionLabel: {
    color: colors.textSecondary,
    fontFamily: theme.typography.family.primary.bold,
    letterSpacing: 0.8,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: spacing.s8,
    marginTop: -spacing.s8,
  },
  methodBtn: {
    flex: 1,
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    paddingVertical: spacing.s12,
    paddingHorizontal: spacing.s8,
    alignItems: 'center',
    gap: spacing.s4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  methodBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.midnight[900],
  },
  methodIcon: { fontSize: 22 },
  methodBtnLabel: { color: colors.textSecondary, textAlign: 'center' },
  methodBtnLabelActive: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
  },

  formSection: { gap: spacing.s12 },
  bankCard: {
    backgroundColor: colors.midnight[900],
    borderRadius: borderRadius.s16,
    padding: spacing.s16,
    gap: spacing.s8,
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  bankCardLabel: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
    letterSpacing: 0.8,
    marginBottom: spacing.s4,
  },
  bankCardField: { color: colors.textPrimary },
  bankFieldKey: {
    color: colors.textSecondary,
    fontFamily: theme.typography.family.primary.bold,
  },
  formLabel: {
    color: colors.textSecondary,
    fontFamily: theme.typography.family.primary.bold,
    letterSpacing: 0.8,
    marginTop: spacing.s4,
  },
  fieldWrapper: { gap: spacing.s4 },
  fieldLabel: { color: colors.textSecondary },
  input: {
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s8,
    borderWidth: 1,
    borderColor: colors.midnight[600],
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s12,
    color: colors.textPrimary,
    fontFamily: theme.typography.family.primary.regular,
    fontSize: 15,
  },

  pointsBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s8,
    borderBottomWidth: 1,
    borderBottomColor: colors.midnight[700],
    marginBottom: spacing.s4,
  },
  pointsBalanceMain: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 15,
  },
  pointsBalanceSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  redeemInput: {
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s8,
    padding: spacing.s12,
    color: colors.textPrimary,
    marginTop: spacing.s8,
    borderWidth: 1,
    borderColor: colors.midnight[600],
    fontSize: 15,
    fontFamily: theme.typography.family.primary.regular,
  },
  estimateNote: {
    color: colors.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: spacing.s4,
  },

  bottomBar: {
    backgroundColor: 'rgba(35, 22, 64, 0.97)',
    paddingHorizontal: spacing.s16,
    paddingTop: spacing.s12,
    paddingBottom: spacing.s12,
    borderTopWidth: 1,
    borderTopColor: colors.midnight[700],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  payBtn: {
    width: '100%',
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.s8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnDisabled: { opacity: 0.4 },
  payBtnText: { color: colors.midnight[950] },
});
