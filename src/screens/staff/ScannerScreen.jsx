import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  Armchair,
  ArrowLeft,
  CheckCircle2,
  Gift,
  Popcorn,
  ScanLine,
  Ticket,
  XCircle,
} from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppText } from '../../components/ui/AppText';
import { CustomButton } from '../../components/ui/CustomButton';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { theme } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import {
  staffValidationService,
  VALIDATION_TYPE,
} from '../../services/staff-validation.service';

const { colors, spacing, borderRadius, typography } = theme;

/**
 * Escáner del staff (RF-48 a RF-51):
 * - RF-48: escaneo del QR con la cámara.
 * - RF-49: el backend valida firma, vigencia y doble uso.
 * - RF-50: la validación de boletos registra la asistencia (tickets_validated_at).
 * - RF-51: resultado visual inmediato (verde = autorizado, rojo = denegado).
 */
export default function ScannerScreen() {
  const { user, logout } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();

  const [scannedCode, setScannedCode] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detail, setDetail] = useState(null); // { tickets, tickets_used, concessions, concessions_used }
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null); // { ok, title, message }
  const scanLock = useRef(false);

  const resetScanner = () => {
    scanLock.current = false;
    setScannedCode(null);
    setDetail(null);
    setResult(null);
  };

  const onBarcodeScanned = async ({ data }) => {
    if (scanLock.current || !data) return;
    scanLock.current = true;
    setScannedCode(data);
    setLoadingDetail(true);
    try {
      // Cargamos ambos detalles; cada uno puede no aplicar (orden solo de boletos, etc.)
      const [ticketsRes, concessionsRes] = await Promise.all([
        staffValidationService.getTicketsByQr(data).catch(() => null),
        staffValidationService.getConcessionsByQr(data).catch(() => null),
      ]);
      if (!ticketsRes && !concessionsRes) {
        setResult({ ok: false, title: 'QR inválido', message: 'El código no corresponde a una orden.' });
        return;
      }
      setDetail({
        tickets: ticketsRes?.tickets ?? [],
        tickets_used: ticketsRes?.tickets_used ?? false,
        concessions: concessionsRes?.concessions ?? [],
        concessions_used: concessionsRes?.concessions_used ?? false,
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  const runAction = async (fn, okTitle, okMessage) => {
    setProcessing(true);
    try {
      await fn();
      setResult({ ok: true, title: okTitle, message: okMessage });
    } catch (e) {
      const message = e?.response?.data?.message || 'No se pudo completar la validación.';
      setResult({ ok: false, title: 'Denegado', message });
    } finally {
      setProcessing(false);
    }
  };

  const validateTickets = () =>
    runAction(
      () => staffValidationService.validateQr(scannedCode, VALIDATION_TYPE.TICKETS),
      'Acceso autorizado',
      'Entrada validada. Asistencia registrada.'
    );

  const validateConcessions = () =>
    runAction(
      () => staffValidationService.validateQr(scannedCode, VALIDATION_TYPE.CONCESSIONS),
      'Entrega autorizada',
      'Confitería marcada como entregada.'
    );

  const deliverRedemption = () =>
    runAction(
      () => staffValidationService.redemptionPickup(scannedCode),
      'Premio entregado',
      'Canje retirado. Inventario actualizado.'
    );

  // ---- Permiso de cámara ----
  if (!permission) return null;
  if (!permission.granted) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ScanLine size={40} color={colors.primary} />
          <AppText style={styles.centerTitle}>Permiso de cámara</AppText>
          <AppText style={styles.centerText}>
            Necesitamos la cámara para escanear los códigos QR de los clientes.
          </AppText>
          <CustomButton title="Permitir cámara" onPress={requestPermission} />
        </View>
      </ScreenWrapper>
    );
  }

  // ---- RF-51: resultado visual a pantalla completa ----
  if (result) {
    return (
      <View style={[styles.resultScreen, result.ok ? styles.resultOk : styles.resultFail]}>
        {result.ok ? (
          <CheckCircle2 size={96} color="#fff" strokeWidth={1.5} />
        ) : (
          <XCircle size={96} color="#fff" strokeWidth={1.5} />
        )}
        <AppText style={styles.resultTitle}>{result.title}</AppText>
        <AppText style={styles.resultMessage}>{result.message}</AppText>
        <TouchableOpacity style={styles.resultBtn} onPress={resetScanner} activeOpacity={0.85}>
          <AppText style={styles.resultBtnText}>Escanear siguiente</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  // ---- Detalle escaneado: qué contiene la orden y acciones ----
  if (scannedCode) {
    return (
      <ScreenWrapper>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={resetScanner} hitSlop={12}>
            <ArrowLeft size={22} color={colors.primary} strokeWidth={1} />
          </TouchableOpacity>
          <AppText style={styles.topBarTitle}>Detalle de la orden</AppText>
          <View style={styles.spacer} />
        </View>

        {loadingDetail || !detail ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.detailScroll}>
            {detail.tickets.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ticket size={18} color={colors.primary} />
                  <AppText style={styles.cardTitle}>Boletos</AppText>
                  {detail.tickets_used && (
                    <View style={styles.usedTag}>
                      <AppText style={styles.usedTagText}>YA VALIDADOS</AppText>
                    </View>
                  )}
                </View>
                <AppText style={styles.cardMovie}>
                  {detail.tickets[0]?._RoomBookings?.name ?? 'Función'}
                </AppText>
                <View style={styles.seatsRow}>
                  <Armchair size={14} color={colors.textSecondary} />
                  <AppText style={styles.seatsText}>
                    {detail.tickets
                      .map((t) => `${t._Seats?.row_identifier ?? ''}${t._Seats?.column_number ?? ''}`)
                      .join(', ')}
                  </AppText>
                </View>
                <CustomButton
                  title={detail.tickets_used ? 'Entrada ya validada' : 'Validar entrada'}
                  onPress={validateTickets}
                  disabled={detail.tickets_used || processing}
                />
              </View>
            )}

            {detail.concessions.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Popcorn size={18} color={colors.primary} />
                  <AppText style={styles.cardTitle}>Confitería</AppText>
                  {detail.concessions_used && (
                    <View style={styles.usedTag}>
                      <AppText style={styles.usedTagText}>YA ENTREGADA</AppText>
                    </View>
                  )}
                </View>
                {detail.concessions.map((line) => (
                  <AppText key={line.id} style={styles.lineText}>
                    {line.quantity} × {line._Products?.name ?? line._Combos?.name ?? 'Ítem'}
                  </AppText>
                ))}
                <CustomButton
                  title={detail.concessions_used ? 'Confitería ya entregada' : 'Entregar confitería'}
                  onPress={validateConcessions}
                  disabled={detail.concessions_used || processing}
                />
                {/* Si la orden es un CANJE de premio, la entrega correcta es esta
                    (descuenta inventario). El backend rechaza si no es un canje. */}
                <TouchableOpacity onPress={deliverRedemption} disabled={processing} style={styles.redemptionLink}>
                  <Gift size={14} color={colors.primary} />
                  <AppText style={styles.redemptionLinkText}>
                    ¿Es un premio canjeado? Entregar canje
                  </AppText>
                </TouchableOpacity>
              </View>
            )}

            {detail.tickets.length === 0 && detail.concessions.length === 0 && (
              <View style={styles.center}>
                <AppText style={styles.centerText}>La orden no tiene ítems para validar.</AppText>
              </View>
            )}
          </ScrollView>
        )}
      </ScreenWrapper>
    );
  }

  // ---- Cámara (RF-48) ----
  return (
    <View style={styles.cameraContainer}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onBarcodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.overlayHeader}>
          <AppText style={styles.overlayTitle}>Escanear QR</AppText>
          <AppText style={styles.overlaySub}>
            {user?.firstName ? `Operador: ${user.firstName}` : 'Apunta al código del cliente'}
          </AppText>
        </View>
        <View style={styles.frame} />
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <AppText style={styles.logoutText}>Cerrar sesión</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.s12,
    padding: spacing.s24,
  },
  centerTitle: { color: colors.textPrimary, fontSize: 18, fontFamily: typography.family.primary.bold },
  centerText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  // cámara
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 60 },
  overlayHeader: { alignItems: 'center', gap: 4 },
  overlayTitle: { color: '#fff', fontSize: 20, fontFamily: typography.family.primary.bold },
  overlaySub: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  frame: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  logoutBtn: { padding: spacing.s12 },
  logoutText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, textDecorationLine: 'underline' },
  // detalle
  backButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s12,
  },
  topBarTitle: { color: colors.primary, fontSize: 18, fontFamily: typography.family.primary.bold },
  detailScroll: { padding: spacing.s16, gap: spacing.s16 },
  card: {
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    padding: spacing.s16,
    gap: spacing.s8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.s8 },
  cardTitle: { color: colors.textPrimary, fontSize: 15, fontFamily: typography.family.primary.bold, flex: 1 },
  usedTag: { backgroundColor: 'rgba(255,99,99,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  usedTagText: { color: '#ff6363', fontSize: 10, fontFamily: typography.family.primary.bold },
  cardMovie: { color: colors.textPrimary, fontSize: 14 },
  seatsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.s8 },
  seatsText: { color: colors.textSecondary, fontSize: 13 },
  lineText: { color: colors.textSecondary, fontSize: 13 },
  redemptionLink: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', padding: 6 },
  redemptionLinkText: { color: colors.primary, fontSize: 12, textDecorationLine: 'underline' },
  // resultado (RF-51)
  resultScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.s16, padding: spacing.s24 },
  resultOk: { backgroundColor: '#1d8a4e' },
  resultFail: { backgroundColor: '#b3282d' },
  resultTitle: { color: '#fff', fontSize: 26, fontFamily: typography.family.primary.bold },
  resultMessage: { color: 'rgba(255,255,255,0.9)', fontSize: 15, textAlign: 'center' },
  resultBtn: {
    marginTop: spacing.s16,
    backgroundColor: '#fff',
    paddingHorizontal: spacing.s32,
    paddingVertical: spacing.s12,
    borderRadius: borderRadius.s8,
  },
  resultBtnText: { color: '#1c1c1c', fontFamily: typography.family.primary.bold, fontSize: 15 },
});
