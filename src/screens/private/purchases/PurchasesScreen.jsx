import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppText } from '../../../components/AppText';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { usersService } from '../../../services/users.service';
import { theme } from '../../../constants';

const { colors, spacing, borderRadius } = theme;

// ─── Mapeo de estados del backend ────────────────────────────────────────────
// 1=Pendiente, 2=Pagado(empleado), 3=Cancelado, 4=Completado
const ORDER_STATUS = {
  1: {
    label: 'Pendiente',
    color: colors.yellow[400],
    bg: `${colors.yellow[400]}22`,
  },
  2: {
    label: 'Pagado',
    color: colors.indigo[300],
    bg: `${colors.indigo[300]}22`,
  },
  3: { label: 'Cancelado', color: colors.red[500], bg: `${colors.red[500]}22` },
  4: {
    label: 'Completado',
    color: colors.green[500],
    bg: `${colors.green[500]}22`,
  },
};

const FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'tickets', label: 'Próximas' },
  { key: 'concessions', label: 'Solo confitería' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-VE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Extrae el título de la película desde las relaciones anidadas del backend
const getMovieTitle = (order) => {
  const tickets = order._Tickets || [];
  if (!tickets.length) return null;
  const booking = tickets[0]?._RoomBookings;
  return (
    booking?._Showtimes?._Movies?.title || booking?._RoomEvents?.title || null
  );
};

// Extrae la imagen del póster
const getPosterUrl = (order) => {
  const tickets = order._Tickets || [];
  if (!tickets.length) return null;
  const booking = tickets[0]?._RoomBookings;
  return (
    booking?._Showtimes?._Movies?.poster_url ||
    booking?._Showtimes?._Movies?.image_url ||
    null
  );
};

const getShowtimeDate = (order) => {
  const tickets = order._Tickets || [];
  if (!tickets.length) return null;
  const booking = tickets[0]?._RoomBookings;
  const st = booking?._Showtimes;
  if (!st?.start_time) return null;
  return new Date(st.start_time).toLocaleDateString('es-VE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const getRoomName = (order) => {
  const tickets = order._Tickets || [];
  if (!tickets.length) return null;
  return tickets[0]?._RoomBookings?._Rooms?.name || null;
};

const getCinemaName = (order) => order._Cinemas?.name || '—';

const getSeatLabels = (order) => {
  const tickets = order._Tickets || [];
  if (!tickets.length) return '—';
  return (
    tickets
      .map(
        (t) =>
          `${t._Seats?.row_identifier || ''}${t._Seats?.column_number || ''}`
      )
      .filter(Boolean)
      .join(', ') || '—'
  );
};

const getConcessionsText = (order) => {
  const lines = order._OrderLines || [];
  if (!lines.length) return null;
  return lines
    .map((l) => {
      const name = l._Products?.name || l._Combos?.name || 'Ítem';
      return `${l.quantity}× ${name}`;
    })
    .join('  •  ');
};

// ─── Componente: tarjeta de orden ────────────────────────────────────────────
function OrderCard({ order, onPress }) {
  const statusInfo = ORDER_STATUS[order.order_status] || ORDER_STATUS[4];
  const movieTitle = getMovieTitle(order);
  const posterUrl = getPosterUrl(order);
  const showtimeDate = getShowtimeDate(order);
  const roomName = getRoomName(order);
  const cinemaName = getCinemaName(order);
  const seats = getSeatLabels(order);
  const concessions = getConcessionsText(order);
  const hasTickets = (order._Tickets || []).length > 0;
  const isOnlyConcessionsOrder =
    !hasTickets && (order._OrderLines || []).length > 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Fecha de compra (encima de la tarjeta, centrada) */}
      <AppText variant="caption" style={styles.purchasedAt}>
        Comprado el {formatDate(order.created_at)}
      </AppText>

      <View style={styles.cardBody}>
        {/* Poster / imagen */}
        <View style={styles.posterContainer}>
          {posterUrl ? (
            <Image
              source={{ uri: posterUrl }}
              style={styles.poster}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.posterPlaceholder}>
              <AppText style={styles.posterPlaceholderText}>
                {isOnlyConcessionsOrder ? '🍿' : '🎬'}
              </AppText>
            </View>
          )}
        </View>

        {/* Contenido central */}
        <View style={styles.cardContent}>
          <AppText
            variant="smallText"
            style={styles.movieTitle}
            numberOfLines={2}
          >
            {movieTitle ||
              (isOnlyConcessionsOrder ? 'Confitería' : 'Orden #' + order.id)}
          </AppText>

          {showtimeDate && (
            <InfoRow label="Fecha y Hora" value={showtimeDate} />
          )}
          {hasTickets && <InfoRow label="Boletos" value={seats} />}
          {roomName && <InfoRow label="Función" value={roomName} />}
          <InfoRow label="Sucursal" value={cinemaName} />
          {concessions && (
            <InfoRow label="Confitería" value={concessions} multiline />
          )}
        </View>
      </View>

      {/* Footer: estado + total + acción */}
      <View style={styles.cardFooter}>
        {/* Badge de estado */}
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
          <AppText
            variant="caption"
            style={[styles.statusText, { color: statusInfo.color }]}
          >
            {statusInfo.label}
          </AppText>
        </View>

        <View style={styles.footerRight}>
          <View style={styles.totalBadge}>
            <AppText variant="caption" style={styles.totalBadgeLabel}>
              Total
            </AppText>
            <AppText variant="smallText" style={styles.totalBadgeValue}>
              {fmt(order.total_amount_base_currency)}
            </AppText>
          </View>

          {/* Solo mostrar "Ver QR" si la orden está pagada/completada y tiene QR */}
          {(order.order_status === 2 || order.order_status === 4) &&
            order.qr_code && (
              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={onPress}
                activeOpacity={0.8}
              >
                <AppText variant="caption" style={styles.downloadBtnText}>
                  Ver QR
                </AppText>
              </TouchableOpacity>
            )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Micro-componente: fila de info ──────────────────────────────────────────
function InfoRow({ label, value, multiline }) {
  return (
    <View style={styles.infoRow}>
      <AppText variant="caption" style={styles.infoLabel}>
        {label}
      </AppText>
      <AppText
        variant="caption"
        style={styles.infoValue}
        numberOfLines={multiline ? 3 : 1}
      >
        {value}
      </AppText>
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function PurchasesScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const result = await usersService.getMyOrders({ limit: 50 });
      setOrders(result?.rows || result || []);
    } catch (err) {
      console.error('Error cargando historial:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ─── Filtrado local ──────────────────────────────────────────────────────
  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'tickets') {
      return (order._Tickets || []).length > 0;
    }
    if (activeFilter === 'concessions') {
      return (
        (order._Tickets || []).length === 0 &&
        (order._OrderLines || []).length > 0
      );
    }
    return true;
  });

  const handlePressOrder = (order) => {
    router.push({
      pathname: '/(main)/purchases/[orderId]',
      params: { orderId: order.id },
    });
  };

  // ─── Estados vacíos ──────────────────────────────────────────────────────
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <AppText style={styles.emptyEmoji}>🎟️</AppText>
        <AppText variant="subtitle" style={styles.emptyTitle}>
          {activeFilter === 'all'
            ? 'Aún no tienes compras'
            : 'No hay órdenes en esta categoría'}
        </AppText>
        <AppText variant="caption" style={styles.emptySubtitle}>
          {activeFilter === 'all'
            ? 'Tus boletos y pedidos de confitería aparecerán aquí'
            : 'Prueba con otro filtro'}
        </AppText>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      {/* ── Header ── */}
      <View style={styles.header}>
        <AppText variant="h2" style={styles.headerTitle}>
          Mis Compras
        </AppText>
        <AppText variant="caption" style={styles.headerSubtitle}>
          Consulta tus boletos y el registro de tus compras
        </AppText>
      </View>

      {/* ── Filtros ── */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              activeFilter === f.key && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(f.key)}
            activeOpacity={0.8}
          >
            <AppText
              variant="caption"
              style={[
                styles.filterLabel,
                activeFilter === f.key && styles.filterLabelActive,
              ]}
            >
              {f.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Lista ── */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={() => handlePressOrder(item)} />
          )}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchOrders(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </ScreenWrapper>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.s16,
    paddingTop: spacing.s16,
    paddingBottom: spacing.s12,
    gap: spacing.s4,
  },
  headerTitle: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
  },
  headerSubtitle: {
    color: colors.textSecondary,
  },

  // ── Filtros ──
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.s16,
    gap: spacing.s8,
    marginBottom: spacing.s12,
  },
  filterChip: {
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s8,
    borderRadius: borderRadius.sFull,
    borderWidth: 1.5,
    borderColor: colors.midnight[600],
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterLabel: {
    color: colors.textSecondary,
  },
  filterLabelActive: {
    color: colors.midnight[950],
    fontFamily: theme.typography.family.primary.bold,
  },

  // ── Lista ──
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.s16,
    paddingBottom: spacing.s24,
  },
  separator: {
    height: spacing.s12,
  },

  // ── Tarjeta ──
  card: {
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  purchasedAt: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.s8,
    backgroundColor: colors.midnight[900],
    letterSpacing: 0.3,
  },
  cardBody: {
    flexDirection: 'row',
    padding: spacing.s12,
    gap: spacing.s12,
  },

  // ── Poster ──
  posterContainer: {
    width: 90,
    height: 120,
    borderRadius: borderRadius.s8,
    overflow: 'hidden',
    flexShrink: 0,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.midnight[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterPlaceholderText: {
    fontSize: 32,
  },

  // ── Contenido ──
  cardContent: {
    flex: 1,
    gap: spacing.s4,
  },
  movieTitle: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
    marginBottom: spacing.s4,
    lineHeight: 20,
  },
  infoRow: {
    gap: 2,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: 12,
    lineHeight: 16,
  },

  // ── Footer ──
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.s12,
    paddingBottom: spacing.s12,
    gap: spacing.s8,
  },
  statusBadge: {
    paddingHorizontal: spacing.s8,
    paddingVertical: spacing.s4,
    borderRadius: borderRadius.sFull,
  },
  statusText: {
    fontFamily: theme.typography.family.primary.bold,
    fontSize: 11,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s8,
  },
  totalBadge: {
    backgroundColor: colors.midnight[900],
    borderRadius: borderRadius.s8,
    paddingHorizontal: spacing.s10,
    paddingVertical: spacing.s4,
    alignItems: 'center',
  },
  totalBadgeLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  totalBadgeValue: {
    color: colors.textPrimary,
    fontFamily: theme.typography.family.primary.bold,
  },
  downloadBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.s8,
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s8,
  },
  downloadBtnText: {
    color: colors.midnight[950],
    fontFamily: theme.typography.family.primary.bold,
  },

  // ── Vacío ──
  emptyContainer: {
    flex: 1,
    paddingTop: spacing.s48,
    alignItems: 'center',
    gap: spacing.s12,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    color: colors.textPrimary,
    textAlign: 'center',
    fontFamily: theme.typography.family.primary.bold,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
