import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    ScrollView,
    Share,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../../../components/ui/AppText';
import { theme } from '../../../constants';

const { colors, spacing, borderRadius } = theme;
const fmt = (n) =>
  `${Number(n || 0).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} Bs`;
const fmtPts = (n) => `${Number(n || 0).toLocaleString('es-VE')} pts`;

// ─── Check animado ────────────────────────────────────────────────────────────
function SuccessCheckmark() {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.check, { transform: [{ scale }], opacity }]}>
      <AppText style={styles.checkIcon}>✓</AppText>
    </Animated.View>
  );
}

// ─── Sección QR ───────────────────────────────────────────────────────────────
function QrSection({ qrCode }) {
  if (!qrCode) {
    return (
      <View style={styles.qrCard}>
        <AppText style={styles.qrNoCodeText}>
          Tu QR será enviado por correo electrónico
        </AppText>
      </View>
    );
  }
  return (
    <View style={styles.qrCard}>
      <View style={styles.qrBox}>
        <QRCode
          value={qrCode}
          size={180}
          backgroundColor="white"
          color="#231640"
          quietZone={10}
        />
      </View>
      <AppText style={styles.qrHint}>
        Presenta este código en la entrada y en confitería
      </AppText>
    </View>
  );
}

// ─── Fila de detalle ──────────────────────────────────────────────────────────
function DetailRow({ icon, label, value }) {
  return (
    <View style={styles.detailRow}>
      <AppText style={styles.detailIcon}>{icon}</AppText>
      <View style={styles.detailTexts}>
        <AppText style={styles.detailLabel}>{label}</AppText>
        <AppText style={styles.detailValue}>{value}</AppText>
      </View>
    </View>
  );
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────
export default function OrderSuccessScreen() {
  const router = useRouter();
  const {
    qrCode,
    orderId,
    total,
    paymentMethod,
    isPoints,
    pointsUsed,
    paymentsSummary,
  } = useLocalSearchParams();

  // Desglose de métodos de pago (pago dividido o simple)
  let paymentsBreakdown = [];
  try {
    paymentsBreakdown = paymentsSummary ? JSON.parse(paymentsSummary) : [];
    if (!Array.isArray(paymentsBreakdown)) paymentsBreakdown = [];
  } catch {
    paymentsBreakdown = [];
  }
  const totalAmount = Number(total || 0);
  const paidWithPoints = isPoints === '1';
  const pointsRedeemed = Number(pointsUsed || 0);

  // Respaldo: si el evento de socket llegó sin QR (o se perdió), lo
  // recuperamos por REST desde la orden — el backend ya lo guardó en BD.
  const [resolvedQr, setResolvedQr] = useState(qrCode || '');
  useEffect(() => {
    if (resolvedQr || !orderId) return;
    let cancelled = false;
    (async () => {
      try {
        const { getOrderById } = await import(
          '../../../services/orders.service'
        );
        const order = await getOrderById(orderId);
        if (!cancelled && order?.qr_code) setResolvedQr(order.qr_code);
      } catch (err) {
        if (__DEV__) console.log('[order-success] fallback QR falló:', err?.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, resolvedQr]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Compré mis entradas en Cineflix! 🎬\nTotal: ${fmt(totalAmount)}\nPresenta tu QR en la entrada.`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[colors.lila[800], colors.midnight[900], colors.midnight[950]]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Check */}
        <SuccessCheckmark />

        {/* Título */}
        <AppText variant="h2" style={styles.title}>
          ¡Compra exitosa!
        </AppText>
        <AppText style={styles.subtitle}>
          Tu código QR está listo. Preséntalo en la entrada de la sala y en
          confitería.
        </AppText>

        {/* QR */}
        <QrSection qrCode={resolvedQr} />

        {/* Detalles */}
        <View style={styles.detailsCard}>
          <AppText style={styles.detailsTitle}>Detalle de compra</AppText>

          {paymentsBreakdown.length > 0 ? (
            paymentsBreakdown.map((pago, index) => (
              <View key={`${pago.label}-${index}`}>
                <DetailRow
                  icon={pago.icon || '💳'}
                  label={
                    paymentsBreakdown.length > 1
                      ? `Método ${index + 1}: ${pago.label}`
                      : `Método de pago: ${pago.label}`
                  }
                  value={
                    pago.pts
                      ? `${fmtPts(pago.pts)} · ${fmt(Number(pago.amountVes) || 0)}`
                      : fmt(Number(pago.amountVes) || 0)
                  }
                />
                <View style={styles.divider} />
              </View>
            ))
          ) : (
            <>
              <DetailRow
                icon="💳"
                label="Método de pago"
                value={paymentMethod || '—'}
              />
              <View style={styles.divider} />
              {paidWithPoints ? (
                <>
                  <DetailRow
                    icon="🎟️"
                    label="CinePuntos canjeados"
                    value={fmtPts(pointsRedeemed)}
                  />
                  <View style={styles.divider} />
                </>
              ) : null}
            </>
          )}
          <DetailRow icon="💰" label="Total pagado" value={fmt(totalAmount)} />
          <View style={styles.divider} />
          <DetailRow
            icon="📧"
            label="Confirmación"
            value="Revisa tu correo para el recibo de compra"
          />
        </View>

        {/* Nota expiración */}
        <View style={styles.noteBox}>
          <AppText style={styles.noteText}>
            🎟️ Tu QR de boletos expira al finalizar la función.{'\n'}
            🍿 Tu QR de confitería es válido hasta las 11:59 pm de hoy.
          </AppText>
        </View>

        {/* Acciones */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <AppText style={styles.secondaryBtnText}>Compartir</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace('/(main)/purchases')}
            activeOpacity={0.8}
          >
            <AppText style={styles.secondaryBtnText}>Mis compras</AppText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace('/(main)/home')}
          activeOpacity={0.8}
        >
          <AppText style={styles.primaryBtnText}>Volver al inicio</AppText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos — solo usa spacing existentes: s4 s8 s12 s16 s24 s32 s48 ────────
const styles = StyleSheet.create({
  screen: { flex: 1 },

  scroll: {
    paddingHorizontal: spacing.s16,
    paddingTop: spacing.s24,
    paddingBottom: spacing.s32,
    alignItems: 'center',
  },

  // Check
  check: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.green[400],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s16,
    elevation: 8,
    shadowColor: colors.green[400],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  checkIcon: {
    fontSize: 32,
    color: colors.midnight[950],
    fontFamily: theme.typography.family.primary.bold,
  },

  // Títulos
  title: {
    color: colors.textPrimary,
    fontFamily: theme.typography.family.primary.bold,
    textAlign: 'center',
    marginBottom: spacing.s8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.s16,
  },

  // QR
  qrCard: {
    width: '100%',
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    padding: spacing.s16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.midnight[700],
    marginBottom: spacing.s12,
    gap: spacing.s12,
  },
  qrBox: {
    padding: spacing.s8,
    backgroundColor: 'white',
    borderRadius: borderRadius.s8,
  },
  qrHint: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  qrNoCodeText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: spacing.s8,
  },

  // Detalles
  detailsCard: {
    width: '100%',
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    padding: spacing.s16,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    marginBottom: spacing.s12,
  },
  detailsTitle: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 14,
    letterSpacing: 0.4,
    marginBottom: spacing.s12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.midnight[700],
    marginVertical: spacing.s8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.s12,
  },
  detailIcon: { fontSize: 18, marginTop: 2 },
  detailTexts: { flex: 1, gap: spacing.s4 },
  detailLabel: { color: colors.textSecondary, fontSize: 12 },
  detailValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: theme.typography.family.primary.regular,
  },

  // Nota
  noteBox: {
    width: '100%',
    backgroundColor: `${colors.gold[400]}15`,
    borderRadius: borderRadius.s8,
    borderWidth: 1,
    borderColor: `${colors.gold[400]}35`,
    padding: spacing.s12,
    marginBottom: spacing.s16,
  },
  noteText: {
    color: colors.gold[300],
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Acciones
  actionsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.s12,
    marginBottom: spacing.s12,
  },
  secondaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.s8,
    borderWidth: 1.5,
    borderColor: colors.midnight[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: theme.typography.family.primary.regular,
  },
  primaryBtn: {
    width: '100%',
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.s8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: colors.midnight[950],
    fontSize: 15,
    fontFamily: theme.typography.family.primary.bold,
  },
});
