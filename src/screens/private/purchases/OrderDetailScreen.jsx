import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { AppText } from '../../../components/AppText';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { usersService } from '../../../services/users.service';
import { theme } from '../../../constants';

const { colors, spacing, borderRadius } = theme;

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

const ORDER_STATUS = {
  1: { label: 'Pendiente',  color: colors.yellow[400] },
  2: { label: 'Pagado',     color: colors.indigo[300] },
  3: { label: 'Cancelado',  color: colors.red[500]    },
  4: { label: 'Completado', color: colors.green[500]  },
};

const formatDateTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-VE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-VE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};

// ─── Sub-componente: sección con título ──────────────────────────────────────
function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <AppText variant="caption" style={styles.sectionTitle}>{title}</AppText>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <AppText variant="caption" style={styles.detailLabel}>{label}</AppText>
      <AppText variant="smallText" style={styles.detailValue}>{value}</AppText>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

// ─── QR ─────────────────────────────────────────────────────────────────────
function QrSection({ qrCode, ticketsValidated, concessionsValidated }) {
  if (!qrCode) return null;

  return (
    <Section title="CÓDIGO QR">
      <View style={styles.qrWrapper}>
        <View style={styles.qrBox}>
          <QRCode
            value={qrCode}
            size={180}
            backgroundColor="white"
            color="#231640"
            quietZone={10}
          />
        </View>
        <AppText variant="caption" style={styles.qrHint}>
          Presenta este código en taquilla y confitería
        </AppText>

        {/* Indicadores de uso */}
        <View style={styles.validationRow}>
          <ValidationPill
            label="Boletos"
            used={!!ticketsValidated}
            date={ticketsValidated}
          />
          <ValidationPill
            label="Confitería"
            used={!!concessionsValidated}
            date={concessionsValidated}
          />
        </View>
      </View>
    </Section>
  );
}

function ValidationPill({ label, used, date }) {
  return (
    <View style={[styles.pill, used ? styles.pillUsed : styles.pillPending]}>
      <AppText variant="caption" style={[styles.pillText, used ? styles.pillTextUsed : styles.pillTextPending]}>
        {used ? `✓ ${label} canjeado` : `○ ${label} sin canjear`}
      </AppText>
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function OrderDetailScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        const result = await usersService.getMyOrders({ limit: 100 });
        const rows = result?.rows || result || [];
        const found = rows.find((o) => String(o.id) === String(orderId));
        if (!found) setError('Orden no encontrada.');
        else setOrder(found);
      } catch (err) {
        console.error('Error cargando detalle de orden:', err);
        setError(err?.response?.data?.message || 'Error al cargar la orden.');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <ScreenWrapper style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenWrapper>
    );
  }

  if (error || !order) {
    return (
      <ScreenWrapper>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={26} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.centered}>
          <AppText variant="body" style={styles.errorText}>{error || 'Orden no encontrada'}</AppText>
        </View>
      </ScreenWrapper>
    );
  }

  // ─── Extracción de datos ─────────────────────────────────────────────────
  const statusInfo = ORDER_STATUS[order.order_status] || ORDER_STATUS[4];
  const tickets = order._Tickets || [];
  const lines = order._OrderLines || [];
  const payments = order._OrderPayments || [];

  const firstBooking = tickets[0]?._RoomBookings;
  const showtime = firstBooking?._Showtimes;
  const movieTitle = showtime?._Movies?.title || firstBooking?._RoomEvents?.title || null;
  const roomName = firstBooking?._Rooms?.name || showtime?.room?.name || null;
  const cinemaName = order._Cinemas?.name || '—';

  const seatList = tickets
    .map((t) => `${t._Seats?.row_identifier || ''}${t._Seats?.column_number || ''}`)
    .filter(Boolean);

  return (
    <ScreenWrapper>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={26} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerTexts}>
          <AppText variant="h3" style={styles.headerTitle}>
            {movieTitle || 'Detalle de Orden'}
          </AppText>
          <AppText variant="caption" style={styles.headerOrderId}>
            Orden #{order.id}
          </AppText>
        </View>
        {/* Badge de estado */}
        <View style={[styles.statusBadge, { borderColor: statusInfo.color }]}>
          <AppText variant="caption" style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </AppText>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── QR ── */}
        <QrSection
          qrCode={order.qr_code}
          ticketsValidated={order.tickets_validated_at}
          concessionsValidated={order.concessions_validated_at}
        />

        {/* ── Info de la función ── */}
        {(movieTitle || showtime || cinemaName) && (
          <Section title="FUNCIÓN">
            {movieTitle && <DetailRow label="Película" value={movieTitle} />}
            {showtime?.start_time && (
              <>
                <Divider />
                <DetailRow label="Fecha y hora" value={formatDateTime(showtime.start_time)} />
              </>
            )}
            {roomName && (
              <>
                <Divider />
                <DetailRow label="Sala" value={roomName} />
              </>
            )}
            <Divider />
            <DetailRow label="Sucursal" value={cinemaName} />
          </Section>
        )}

        {/* ── Boletos ── */}
        {tickets.length > 0 && (
          <Section title={`BOLETOS (${tickets.length})`}>
            {tickets.map((ticket, i) => {
              const seat = ticket._Seats;
              const seatLabel = seat
                ? `${seat.row_identifier || ''}${seat.column_number || ''}`
                : `Boleto ${i + 1}`;
              const category = ticket._AudienceCategories?.name || ticket.audience_category;
              return (
                <View key={ticket.id || i}>
                  {i > 0 && <Divider />}
                  <View style={styles.ticketRow}>
                    <View style={styles.seatBadge}>
                      <AppText variant="caption" style={styles.seatBadgeText}>{seatLabel}</AppText>
                    </View>
                    <View style={{ flex: 1 }}>
                      {category && (
                        <AppText variant="caption" style={styles.categoryText}>{category}</AppText>
                      )}
                      <AppText variant="smallText" style={styles.ticketPrice}>
                        {fmt(ticket.price)}
                      </AppText>
                    </View>
                  </View>
                </View>
              );
            })}
          </Section>
        )}

        {/* ── Confitería ── */}
        {lines.length > 0 && (
          <Section title="CONFITERÍA">
            {lines.map((line, i) => {
              const name = line._Products?.name || line._Combos?.name || 'Ítem';
              return (
                <View key={line.id || i}>
                  {i > 0 && <Divider />}
                  <View style={styles.lineRow}>
                    <View style={styles.lineQtyBadge}>
                      <AppText variant="caption" style={styles.lineQtyText}>×{line.quantity}</AppText>
                    </View>
                    <AppText variant="smallText" style={styles.lineName}>{name}</AppText>
                    <AppText variant="smallText" style={styles.linePrice}>
                      {fmt(line.unit_price * line.quantity)}
                    </AppText>
                  </View>
                </View>
              );
            })}
          </Section>
        )}

        {/* ── Resumen de pago ── */}
        <Section title="RESUMEN DE PAGO">
          <DetailRow label="Subtotal" value={fmt(order.subtotal_base_currency)} />
          <Divider />
          <DetailRow
            label="Impuestos"
            value={fmt(order.tax_amount_base_currency)}
          />
          <Divider />
          <View style={styles.totalRow}>
            <AppText variant="smallText" style={styles.totalLabel}>Total pagado</AppText>
            <AppText variant="smallText" style={styles.totalValue}>
              {fmt(order.total_amount_base_currency)}
            </AppText>
          </View>

          {payments.length > 0 && (
            <>
              <Divider />
              {payments.map((p, i) => (
                <DetailRow
                  key={p.id || i}
                  label={`Método ${i + 1}`}
                  value={`${p.payment_method}${p.reference_number ? '  #' + p.reference_number : ''}`}
                />
              ))}
            </>
          )}

          <Divider />
          <DetailRow label="Fecha de compra" value={formatDate(order.created_at)} />

          {order.generated_points > 0 && (
            <>
              <Divider />
              <DetailRow
                label="CinePuntos ganados"
                value={`+${order.generated_points} pts 🎉`}
              />
            </>
          )}
        </Section>
      </ScrollView>
    </ScreenWrapper>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const PADDING = 12; // shorthand para padding de cards

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: colors.textSecondary, textAlign: 'center' },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s16,
    paddingTop: spacing.s8,
    paddingBottom: spacing.s12,
    gap: spacing.s8,
  },
  backBtn: {
    padding: spacing.s4,
  },
  headerTexts: { flex: 1 },
  headerTitle: {
    color: colors.textPrimary,
    fontFamily: theme.typography.family.primary.bold,
    lineHeight: 22,
  },
  headerOrderId: {
    color: colors.textSecondary,
  },
  statusBadge: {
    borderWidth: 1.5,
    borderRadius: borderRadius.sFull,
    paddingHorizontal: spacing.s8,
    paddingVertical: spacing.s4,
  },
  statusText: {
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 11,
  },

  scrollContent: {
    paddingHorizontal: spacing.s16,
    paddingBottom: spacing.s32,
    gap: spacing.s16,
  },

  // ── Secciones ──
  section: { gap: spacing.s8 },
  sectionTitle: {
    color: colors.textSecondary,
    fontFamily: theme.typography.family.primary.bold,
    letterSpacing: 0.8,
    fontSize: 11,
  },
  sectionCard: {
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    padding: PADDING,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    gap: spacing.s8,
  },
  divider: { height: 1, backgroundColor: colors.midnight[700] },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.s8,
  },
  detailLabel: { color: colors.textSecondary, flex: 1 },
  detailValue: {
    color: colors.textPrimary,
    flex: 2,
    textAlign: 'right',
  },

  // ── QR ──
  qrWrapper: { alignItems: 'center', gap: spacing.s12 },
  qrBox: {
    padding: spacing.s12,
    backgroundColor: 'white',
    borderRadius: borderRadius.s8,
  },
  qrHint: { color: colors.textSecondary, textAlign: 'center' },
  validationRow: {
    flexDirection: 'row',
    gap: spacing.s8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pill: {
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s4,
    borderRadius: borderRadius.sFull,
    borderWidth: 1,
  },
  pillPending: {
    borderColor: colors.midnight[600],
    backgroundColor: colors.midnight[900],
  },
  pillUsed: {
    borderColor: colors.green[500],
    backgroundColor: `${colors.green[500]}22`,
  },
  pillText: { fontSize: 11 },
  pillTextPending: { color: colors.textSecondary },
  pillTextUsed: {
    color: colors.green[500],
    fontFamily: theme.typography.family.primary.bold,
  },

  // ── Boletos ──
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s12,
  },
  seatBadge: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.s8,
    backgroundColor: colors.midnight[900],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  seatBadgeText: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 13,
  },
  categoryText: { color: colors.textSecondary },
  ticketPrice: { color: colors.textPrimary },

  // ── Líneas de confitería ──
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s8,
  },
  lineQtyBadge: {
    backgroundColor: colors.midnight[900],
    borderRadius: borderRadius.s4,
    paddingHorizontal: spacing.s8,
    paddingVertical: spacing.s4,
    minWidth: 32,
    alignItems: 'center',
  },
  lineQtyText: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 12,
  },
  lineName: { flex: 1, color: colors.textPrimary },
  linePrice: { color: colors.textSecondary },

  // ── Total ──
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: colors.textPrimary,
    fontFamily: theme.typography.family.primary.bold,
  },
  totalValue: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 18,
  },
});
