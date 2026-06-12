import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
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
import { theme } from '../../../constants';

const { colors, spacing, borderRadius } = theme;

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

// ─── Métodos disponibles ──────────────────────────────────────────────────────
const METHODS = [
  { key: 'mobile_payment', label: 'Pago Móvil', icon: '📱' },
  { key: 'transfer', label: 'Transferencia', icon: '🏦' },
  { key: 'cine_points', label: 'Cine Puntos', icon: '🎟️' },
];

// ─── Datos bancarios del negocio (fijos, solo para mostrar al usuario) ────────
const BANK_INFO = {
  bank: 'Banco Mercantil',
  account: '0105-0000-00-0000000000',
  rif: 'J-12345678-9',
};

// ─── Formulario Pago Móvil ────────────────────────────────────────────────────
function MobilePaymentForm({ data, onChange }) {
  return (
    <View style={styles.formSection}>
      {/* Datos del negocio */}
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

// ─── Formulario Transferencia ─────────────────────────────────────────────────
function TransferForm({ data, onChange }) {
  return (
    <View style={styles.formSection}>
      {/* Datos del negocio */}
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

// ─── Campo reutilizable ────────────────────────────────────────────────────────
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

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function PaymentScreen() {
  const router = useRouter();
  const { total } = useLocalSearchParams();
  const { clearCart } = useCart();
  const insets = useSafeAreaInsets();

  const totalAmount = Number(total || 0);

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(''); // Estado añadido para Cine Puntos
  const [formData, setFormData] = useState({
    bank: '',
    reference: '',
    phone: '',
    date: '',
    holder: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const selectMethod = (key) => {
    setSelectedMethod(key);
    setFormData({ bank: '', reference: '', phone: '', date: '', holder: '' });
  };

  // ─── Validación antes de pagar ────────────────────────────────────────────
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
    // Si es 'cine_points', puedes agregar aquí tu validación para el campo `pointsToRedeem`
    return true;
  };

  const handlePay = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        payment_method: selectedMethod,
        amount: totalAmount,
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
        // Si quisieras enviar los puntos al backend, podrías agregarlo aquí:
        ...(selectedMethod === 'cine_points'
          ? { redeem_points: pointsToRedeem }
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
          total: String(totalAmount),
          paymentMethod: method?.label ?? '',
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

  // Altura del botón inferior = altura fija + safe area bottom
  const bottomBarHeight = 56 + 16 + 16 + insets.bottom;

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
        {/* ── Total ── */}
        <View style={styles.totalCard}>
          <AppText variant="caption" style={styles.totalLabel}>
            Total a pagar
          </AppText>
          <AppText style={styles.totalAmount}>{fmt(totalAmount)}</AppText>
        </View>

        {/* ── Selección de método ── */}
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

        {/* ── Formulario dinámico ── */}
        {selectedMethod === 'mobile_payment' && (
          <MobilePaymentForm data={formData} onChange={setFormData} />
        )}
        {selectedMethod === 'transfer' && (
          <TransferForm data={formData} onChange={setFormData} />
        )}

        {/* ── Bloque condicional de Cine Puntos ── */}
        {selectedMethod === 'cine_points' && (
          <View style={styles.bankCard}>
            <AppText variant="caption" style={styles.bankCardLabel}>
              CANJEAR CINE PUNTOS
            </AppText>
            <View style={styles.fieldWrapper}>
              <AppText style={styles.fieldLabel}>Puntos a utilizar</AppText>
              <TextInput
                style={styles.redeemInput}
                placeholder="Ej: 1000"
                placeholderTextColor={colors.midnight[400]}
                keyboardType="numeric"
                value={pointsToRedeem}
                onChangeText={setPointsToRedeem}
              />
              <AppText style={styles.estimateNote}>
                Tienes disponibles: 5,000 Cine Puntos
              </AppText>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Botón fijo inferior — respeta safe area ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity
          style={[
            styles.payBtn,
            (!selectedMethod || submitting) && styles.payBtnDisabled,
          ]}
          onPress={handlePay}
          disabled={!selectedMethod || submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color={colors.midnight[950]} />
          ) : (
            <AppText variant="button" style={styles.payBtnText}>
              Confirmar pago · {fmt(totalAmount)}
            </AppText>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1 },

  scroll: {
    paddingHorizontal: spacing.s16,
    paddingTop: spacing.s16,
    gap: spacing.s16,
  },

  // ── Total ──
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
  totalAmount: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 34,
  },

  // ── Métodos ──
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

  // ── Formulario ──
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

  // ── Estilo personalizado TextInput para Cine Puntos ──
  redeemInput: {
    backgroundColor: colors.midnight[900],
    borderRadius: borderRadius.s8,
    padding: spacing.s12,
    color: colors.textPrimary,
    marginTop: spacing.s8,
    borderWidth: 1,
    borderColor: colors.midnight[600],
  },
  estimateNote: {
    color: colors.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: spacing.s4,
  },

  // ── Botón inferior ──
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
