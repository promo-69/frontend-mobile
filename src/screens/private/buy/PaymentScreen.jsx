import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
import { AppText } from '../../../components/ui/AppText';
import { theme } from '../../../constants';
import { useCart } from '../../../context/CartContext';
import {
    getSessionDetails,
    getSessionState,
    registerPayment,
} from '../../../services/orders.service';
import {
    getAccountsForMethod,
    getPaymentOptions,
} from '../../../services/payments.service';
import { usePurchaseSession } from '../../../context/PurchaseSessionContext';
import { usePaymentEvents } from '../../../hooks/buy/usePaymentEvents';
import { usersService } from '../../../services/users.service';

const { colors, spacing, borderRadius } = theme;

const USD_CURRENCY_ID = 1;
const PTS_CURRENCY_ID = 3; // Cinepuntos (ver tabla currencies del backend)

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

// ─── Formulario de métodos bancarios (Pago Móvil / Transferencia) ────────────
// El backend exige que se indique a QUÉ cuenta destino de la empresa se pagó
// (campo `bank` = ID del banco de esa cuenta) más el número de referencia.
// Las cuentas destino se obtienen de GET /payments/options.
function BankMethodForm({
  accounts,
  loadingAccounts,
  selectedAccountId,
  onSelectAccount,
  reference,
  onChangeReference,
}) {
  const selected = accounts.find((a) => a.id === selectedAccountId) || null;
  const details = Array.isArray(selected?.payment_details)
    ? selected.payment_details
    : [];

  return (
    <View style={styles.formSection}>
      <AppText variant="caption" style={styles.formLabel}>
        CUENTA DESTINO
      </AppText>

      {loadingAccounts ? (
        <View style={styles.bankCard}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : accounts.length === 0 ? (
        <View style={styles.bankCard}>
          <AppText style={styles.estimateNote}>
            No hay cuentas destino disponibles para este método en este momento.
            Elige otro método de pago.
          </AppText>
        </View>
      ) : (
        <View style={{ gap: spacing.s8 }}>
          {accounts.map((acc) => {
            const active = acc.id === selectedAccountId;
            const bankName = acc._Banks?.name || `Banco #${acc.bank}`;
            const currencyCode = acc._Currencies?.code || '';
            return (
              <TouchableOpacity
                key={acc.id}
                style={[
                  styles.accountCard,
                  active && styles.accountCardActive,
                ]}
                onPress={() => onSelectAccount(acc.id)}
                activeOpacity={0.85}
              >
                <View style={styles.accountHeaderRow}>
                  <AppText style={styles.accountBankName}>{bankName}</AppText>
                  {!!currencyCode && (
                    <AppText style={styles.accountCurrency}>
                      {currencyCode}
                    </AppText>
                  )}
                </View>
                {active &&
                  details.map((d, i) => (
                    <AppText
                      key={`${acc.id}-${i}`}
                      variant="smallText"
                      style={styles.bankCardField}
                    >
                      <AppText style={styles.bankFieldKey}>
                        {d.label}:{' '}
                      </AppText>
                      {d.value}
                    </AppText>
                  ))}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <AppText variant="caption" style={[styles.formLabel, { marginTop: 4 }]}>
        DETALLES DE LA OPERACIÓN
      </AppText>
      <FormField
        label="Número de referencia"
        placeholder="Ej: 12345678"
        value={reference}
        onChangeText={onChangeReference}
        keyboardType="numeric"
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
  // Tasa real de Cinepuntos del backend: cada punto vale `ptsRate` Bs.
  const ptsRate = Number(exchangeRates?.[PTS_CURRENCY_ID]?.rate) || 0;

  // Puntos necesarios para cubrir el total (total Bs / valor de cada punto).
  // Si no hay tasa, no se puede pagar con puntos.
  const pointsNeeded = ptsRate > 0 ? Math.ceil(totalVes / ptsRate) : 0;

  // Máximo que se puede escribir: el saldo del usuario. Si no alcanza para
  // cubrir el total, la validación al pagar se lo indicará claramente.
  const maxRedeemable = pointsBalance;

  const entered = Number(pointsToRedeem) || 0;
  // Valor en Bs que cubren los puntos ingresados (a la tasa real).
  const coveredVes = entered * ptsRate;
  const remaining = Math.max(0, totalVes - coveredVes);

  const usdRate = exchangeRates?.[USD_CURRENCY_ID]?.rate;
  const pointsInUsd =
    usdRate && pointsBalance
      ? ((pointsBalance * ptsRate) / usdRate).toFixed(2)
      : null;

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

      {/* Costo real en puntos de esta compra */}
      {ptsRate > 0 ? (
        <AppText style={styles.estimateNote}>
          Esta compra cuesta{' '}
          <AppText
            style={{
              color: colors.primary,
              fontFamily: theme.typography.family.primary.bold,
            }}
          >
            {pointsNeeded.toLocaleString('es-VE')} pts
          </AppText>{' '}
          (1 pt = {fmtVes(ptsRate)})
        </AppText>
      ) : (
        <AppText style={styles.estimateNote}>
          El pago con CinePuntos no está disponible en este momento.
        </AppText>
      )}

      <View style={styles.fieldWrapper}>
        <AppText style={styles.fieldLabel}>Puntos a utilizar</AppText>
        <TextInput
          style={styles.redeemInput}
          placeholder={`Necesarios: ${pointsNeeded.toLocaleString('es-VE')}`}
          placeholderTextColor={colors.midnight[400]}
          keyboardType="numeric"
          value={pointsToRedeem}
          onChangeText={(v) => {
            // Solo dígitos, sin ceros a la izquierda
            const clean = v.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '');
            const num = Number(clean) || 0;
            if (num > maxRedeemable) {
              onChangePoints(String(maxRedeemable));
            } else {
              onChangePoints(clean);
            }
          }}
        />
        {/* Atajo: rellenar con los puntos exactos que requiere la compra,
            disponible solo si el usuario tiene saldo suficiente. */}
        {ptsRate > 0 && pointsNeeded > 0 && pointsBalance >= pointsNeeded && (
          <TouchableOpacity
            onPress={() => onChangePoints(String(pointsNeeded))}
            style={styles.fillNeededBtn}
            activeOpacity={0.8}
          >
            <AppText style={styles.fillNeededText}>
              Usar {pointsNeeded.toLocaleString('es-VE')} pts (total)
            </AppText>
          </TouchableOpacity>
        )}
        {entered > 0 && (
          <AppText style={styles.estimateNote}>
            Cubre {fmtVes(coveredVes)} · Restante: {fmtVes(remaining)}
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

  const { endSession } = usePurchaseSession();

  const insets = useSafeAreaInsets();

  const totalVes = Number(total || 0);
  const currency = Number(currencyParam || 2);

  // Las tasas pueden venir por params; si llegan vacías (el checkout no las
  // incluye), las pedimos a la sesión de compra, que sí las trae (incluida PTS).
  const [exchangeRates, setExchangeRates] = useState(() => {
    try {
      return exchangeRatesParam ? JSON.parse(exchangeRatesParam) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    // El checkout debería incluir las tasas. Si falta la de Cinepuntos,
    // las recuperamos de la sesión (probamos ambos endpoints).
    const ptsOk =
      exchangeRates &&
      exchangeRates[PTS_CURRENCY_ID] &&
      Number(exchangeRates[PTS_CURRENCY_ID]?.rate) > 0;
    if (ptsOk) return;

    let cancelled = false;
    (async () => {
      // 1. Intento con /orders/session
      try {
        const session = await getSessionState();
        const rates = session?.exchange_rates ?? session?.data?.exchange_rates;
        if (!cancelled && rates && rates[PTS_CURRENCY_ID]) {
          setExchangeRates(rates);
          return;
        }
      } catch (e) {
        // Sin sesión activa: probamos el otro endpoint.
      }
      // 2. Respaldo con /orders/session/details
      try {
        const details = await getSessionDetails();
        const rates =
          details?.session?.exchange_rates ??
          details?.data?.session?.exchange_rates;
        if (!cancelled && rates && rates[PTS_CURRENCY_ID]) {
          setExchangeRates(rates);
        }
      } catch (e) {
        // No es crítico: la UI maneja la ausencia de tasa.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const usdRate = exchangeRates?.[USD_CURRENCY_ID]?.rate;
  const totalUsd = usdRate ? totalVes / usdRate : null;

  // Costo real en Cinepuntos: total Bs / valor de cada punto (tasa del backend).
  const ptsRateMain = Number(exchangeRates?.[PTS_CURRENCY_ID]?.rate) || 0;
  const totalPointsNeeded =
    ptsRateMain > 0 ? Math.ceil(totalVes / ptsRateMain) : null;

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
  // Métodos bancarios: referencia + cuenta destino seleccionada (su `bank` +
  // `currency` es lo que se envía al backend).
  const [reference, setReference] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  // `submitting`: POST en vuelo. `processing`: ya se aceptó (HTTP 200) y estamos
  // esperando el dictamen final por WebSocket (payment_completed/failed/...).
  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const processingTimeoutRef = useRef(null);
  // Evita navegar/alertar dos veces si llegan eventos duplicados.
  const settledRef = useRef(false);

  // ─── Opciones de pago (métodos + cuentas destino) ────────────────────────────
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingOptions(true);
    getPaymentOptions()
      .then((opts) => {
        if (!cancelled) setPaymentOptions(Array.isArray(opts) ? opts : []);
      })
      .catch(() => {
        if (!cancelled) setPaymentOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingOptions(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Cuentas destino disponibles para el método bancario seleccionado.
  const accounts =
    selectedMethod === 'mobile_payment' || selectedMethod === 'transfer'
      ? getAccountsForMethod(paymentOptions, PAYMENT_METHOD_ID[selectedMethod])
      : [];

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
    setReference('');
    setSelectedAccountId(null);
  };

  // ─── Fin del pago: helpers para salir del estado "procesando" ────────────────
  const stopProcessing = () => {
    setProcessing(false);
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
  };

  const goToSuccess = async (qrCode) => {
    if (settledRef.current) return;
    settledRef.current = true;
    stopProcessing();

    endSession();

    await clearCart();
    const method = METHODS.find((m) => m.key === selectedMethod);
    router.replace({
      pathname: '/(buy)/order-success',
      params: {
        qrCode: qrCode || '',
        total: String(totalVes),
        paymentMethod: method?.label ?? '',
        isPoints: selectedMethod === 'points' ? '1' : '0',
        pointsUsed:
          selectedMethod === 'points'
            ? String(Number(pointsToRedeem) || 0)
            : '0',
      },
    });
  };

  // ─── Suscripción a los eventos asíncronos del backend ────────────────────────
  usePaymentEvents({
    // Orden pagada en su totalidad → mostramos el QR.
    onCompleted: (data) => goToSuccess(data?.qrCode),
    // Orden pagada pero requiere facturación (flujo de empleado). Igualmente
    // hay QR, así que avanzamos a la pantalla de éxito.
    onBillingRequired: (data) => goToSuccess(data?.qrCode),
    // Pago PARCIAL: la orden aún debe saldo. No completamos la compra.
    onPartialSuccess: (data) => {
      stopProcessing();
      const remaining = Number(data?.remaining_balance);
      Alert.alert(
        'Pago parcial registrado',
        !isNaN(remaining) && remaining > 0
          ? `Se registró tu pago, pero la orden aún tiene un saldo pendiente de ${fmtVes(remaining)}. Agrega otro pago para completar la compra.`
          : (data?.message ||
              'Se registró un pago parcial. Aún queda saldo pendiente.')
      );
    },
    // Falló el pago (fondos, banco o timeout de POS a los 60s).
    onFailed: (data) => {
      stopProcessing();
      Alert.alert(
        'Pago rechazado',
        data?.message ||
          'No se pudo procesar el pago. Verifica los datos e intenta de nuevo.'
      );
    },
  });

  // Limpieza del timeout de seguridad al desmontar.
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current)
        clearTimeout(processingTimeoutRef.current);
    };
  }, []);

  const validate = () => {
    if (!selectedMethod) {
      Alert.alert('Método requerido', 'Selecciona un método de pago.');
      return false;
    }
    if (selectedMethod === 'mobile_payment' || selectedMethod === 'transfer') {
      if (!selectedAccountId) {
        Alert.alert(
          'Cuenta destino requerida',
          'Selecciona la cuenta a la que realizaste el pago.'
        );
        return false;
      }
      if (!reference.trim()) {
        Alert.alert('Campo requerido', 'Ingresa el número de referencia.');
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
      // Validamos con la TASA REAL de Cinepuntos del backend (no asumimos 1:1).
      // Cada punto vale `ptsRate` Bs; los puntos deben cubrir el total.
      const ptsRate = Number(exchangeRates?.[PTS_CURRENCY_ID]?.rate) || 0;
      if (ptsRate <= 0) {
        Alert.alert(
          'CinePuntos no disponible',
          'No hay una tasa de cambio de CinePuntos configurada. Usa otro método de pago.'
        );
        return false;
      }
      const pointsNeeded = Math.ceil(totalVes / ptsRate);
      if (pts < pointsNeeded) {
        Alert.alert(
          'Puntos insuficientes para esta compra',
          `Esta compra cuesta ${pointsNeeded.toLocaleString('es-VE')} puntos ` +
            `(cada punto vale ${fmtVes(ptsRate)}). Vas a canjear ${pts.toLocaleString('es-VE')}. ` +
            `El pago con CinePuntos debe cubrir el total. ` +
            `Tienes ${pointsBalance.toLocaleString('es-VE')} puntos disponibles.`
        );
        return false;
      }
    }
    return true;
  };

  const handlePay = async () => {
    if (!validate()) return;

    // Construimos el pago según el método (contrato del backend).
    let payment;
    if (selectedMethod === 'points') {
      // Cinepuntos: el backend fuerza la moneda PTS; solo enviamos el monto en
      // puntos. No requiere currency.
      payment = {
        payment_method: PAYMENT_METHOD_ID.points,
        amount: Number(pointsToRedeem) || 0,
      };
    } else {
      // Pago Móvil / Transferencia: cuenta destino (bank + currency) + referencia.
      const account = accounts.find((a) => a.id === selectedAccountId);
      const accountCurrency = Number(account?.currency ?? currency);
      // El monto se envía en la MONEDA de la cuenta destino. exchangeRates guarda
      // la tasa como Bs por unidad de esa moneda, así: monto = totalBs / tasa.
      const rate = Number(exchangeRates?.[accountCurrency]?.rate) || 1;
      const amountInCurrency = Math.round((totalVes / rate) * 100) / 100;

      payment = {
        payment_method: PAYMENT_METHOD_ID[selectedMethod],
        amount: amountInCurrency,
        currency: accountCurrency,
        bank: account?.bank,
        reference_number: reference.trim(),
      };
    }

    settledRef.current = false;
    setSubmitting(true);
    try {
      // El endpoint recibe un ARREGLO de pagos. Aquí enviamos uno solo, pero el
      // servicio lo normaliza a arreglo.
      const res = await registerPayment([payment]);

      // HTTP 200 = "se está procesando", NO "pagado". Entramos en estado de
      // espera y el dictamen final llega por WebSocket (ver usePaymentEvents).
      if (__DEV__) console.log('[payment] aceptado:', res?.message);

      setProcessing(true);

      // Red de seguridad: si no llega ningún evento (incluye el timeout de POS de
      // 60s del backend), liberamos la UI tras 70s.
      processingTimeoutRef.current = setTimeout(() => {
        if (settledRef.current) return;
        stopProcessing();
        Alert.alert(
          'Sin respuesta',
          'No recibimos la confirmación del pago a tiempo. Revisa "Mis Compras" antes de reintentar para no pagar dos veces.'
        );
      }, 70000);
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
          {totalPointsNeeded !== null && (
            <AppText style={styles.totalPoints}>
              ≈ {totalPointsNeeded.toLocaleString('es-VE')} pts
            </AppText>
          )}
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
        {(selectedMethod === 'mobile_payment' ||
          selectedMethod === 'transfer') && (
          <BankMethodForm
            accounts={accounts}
            loadingAccounts={loadingOptions}
            selectedAccountId={selectedAccountId}
            onSelectAccount={setSelectedAccountId}
            reference={reference}
            onChangeReference={setReference}
          />
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
            (!selectedMethod || submitting || processing || timerExpired) &&
              styles.payBtnDisabled,
          ]}
          onPress={handlePay}
          disabled={!selectedMethod || submitting || processing || timerExpired}
          activeOpacity={0.8}
        >
          {submitting || processing ? (
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

      {/* ── Overlay: esperando el dictamen del pago por WebSocket ── */}
      {processing && (
        <View style={styles.processingOverlay} pointerEvents="auto">
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText style={styles.processingTitle}>Procesando pago…</AppText>
            <AppText style={styles.processingSub}>
              Estamos confirmando tu pago. Esto puede tardar unos segundos, no
              cierres esta pantalla.
            </AppText>
          </View>
        </View>
      )}
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
  fillNeededBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.s8,
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s4,
    borderRadius: 16,
    backgroundColor: 'rgba(246,173,56,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(246,173,56,0.4)',
  },
  fillNeededText: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: theme.typography.family.primary.bold,
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

  // Selector de cuenta destino (métodos bancarios)
  accountCard: {
    backgroundColor: colors.midnight[900],
    borderRadius: borderRadius.s16,
    padding: spacing.s16,
    gap: spacing.s4,
    borderWidth: 1.5,
    borderColor: colors.midnight[700],
  },
  accountCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.midnight[800],
  },
  accountHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountBankName: {
    color: colors.textPrimary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 15,
  },
  accountCurrency: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 12,
    letterSpacing: 0.5,
  },

  // Overlay de "procesando pago"
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 10, 30, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.s16,
  },
  processingCard: {
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    paddingVertical: spacing.s16,
    paddingHorizontal: spacing.s16,
    alignItems: 'center',
    gap: spacing.s12,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    maxWidth: 320,
  },
  processingTitle: {
    color: colors.textPrimary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 16,
  },
  processingSub: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
});
