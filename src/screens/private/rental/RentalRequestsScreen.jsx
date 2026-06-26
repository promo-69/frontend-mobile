import { useRouter } from 'expo-router';
import {
    Calendar,
    ChevronDown,
    ChevronLeft,
    Clapperboard,
    Hash,
} from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    FlatList,
    LayoutAnimation,
    Platform,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    UIManager,
    View,
} from 'react-native';
import { AppText } from '../../../components/ui/AppText';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { theme } from '../../../constants';
import { getMyRentalRequests } from '../../../services/info.service';

const { colors, spacing, borderRadius } = theme;

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// RENTAL_STATUS (ver shared/services/rental-management.service.ts en el backend)
const STATUS_STYLE = {
  1: {
    label: 'Pendiente de revisión',
    color: colors.warning ?? colors.gold[400],
    detail:
      'Tu solicitud fue recibida y está siendo evaluada por el equipo del cine.',
  }, // PENDING_REVIEW
  2: {
    label: 'Pendiente de pago',
    color: colors.gold[400],
    detail:
      'Tu solicitud fue aprobada. Falta confirmar el pago para reservar la sala.',
  }, // PENDING_PAYMENT
  3: {
    label: 'Pagada',
    color: colors.success ?? colors.green[500],
    detail: 'Tu evento está confirmado y la sala reservada.',
  }, // PAID
  4: {
    label: 'Rechazada',
    color: colors.error ?? colors.red[500],
    detail:
      'Esta solicitud no fue aprobada. Puedes intentar con otra fecha o sala.',
  }, // REJECTED
  5: {
    label: 'Cancelada',
    color: colors.textSecondary,
    detail: 'Esta solicitud fue cancelada.',
  }, // CANCELLED
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-VE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function RentalRequestItem({ request }) {
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const statusId = request.status?.id;
  const statusInfo = STATUS_STYLE[statusId] ?? {
    label: request.status?.description ?? 'Desconocido',
    color: colors.textSecondary,
    detail: 'No hay información adicional disponible para este estatus.',
  };

  const toggleExpanded = () => {
    if (Platform.OS === 'android') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setExpanded((prev) => !prev);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={toggleExpanded}
      activeOpacity={0.85}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.cardIcon}>
          <Clapperboard size={20} color={colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <AppText style={styles.eventName} numberOfLines={1}>
            {request.event_name}
          </AppText>
          <View style={styles.dateRow}>
            <Calendar size={13} color={colors.textSecondary} />
            <AppText style={styles.dateText}>
              {formatDate(request.requested_start_time)}
            </AppText>
          </View>
        </View>

        <View style={[styles.statusBadge, { borderColor: statusInfo.color }]}>
          <View
            style={[styles.statusDot, { backgroundColor: statusInfo.color }]}
          />
          <AppText style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </AppText>
        </View>

        <Animated.View style={{ transform: [{ rotate }] }}>
          <ChevronDown size={18} color={colors.textSecondary} />
        </Animated.View>
      </View>

      {expanded && (
        <View style={styles.detailWrapper}>
          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Hash size={14} color={colors.textSecondary} />
            <AppText style={styles.detailLabel}>Referencia:</AppText>
            <AppText style={styles.detailValue}>#{request.id}</AppText>
          </View>

          <View style={styles.detailRow}>
            <Calendar size={14} color={colors.textSecondary} />
            <AppText style={styles.detailLabel}>Fecha y hora:</AppText>
            <AppText style={styles.detailValue}>
              {formatDate(request.requested_start_time)}
            </AppText>
          </View>

          <View
            style={[styles.statusDetailBox, { borderColor: statusInfo.color }]}
          >
            <AppText
              style={[styles.statusDetailTitle, { color: statusInfo.color }]}
            >
              {statusInfo.label}
            </AppText>
            <AppText style={styles.statusDetailText}>
              {statusInfo.detail}
            </AppText>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function RentalRequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadRequests = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const result = await getMyRentalRequests();
      setRequests(result?.rows ?? result ?? []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar solicitudes de alquiler:', err);
      setError('No se pudieron cargar tus solicitudes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRequests({ silent: true });
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={26} color={colors.primary} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Mis solicitudes</AppText>
        <View style={{ width: 34 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item, idx) => String(item.id ?? idx)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <RentalRequestItem request={item} />}
          ItemSeparatorComponent={() => (
            <View style={{ height: spacing.s12 }} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <AppText style={styles.emptyText}>
                Todavía no has solicitado el alquiler de ninguna sala.
              </AppText>
            </View>
          }
        />
      )}

      {error && (
        <TouchableOpacity
          onPress={() => loadRequests()}
          style={styles.errorBanner}
        >
          <AppText style={styles.errorText}>
            {error} Toca para reintentar.
          </AppText>
        </TouchableOpacity>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.s48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.s16,
    paddingTop: spacing.s8,
    paddingBottom: spacing.s12,
  },
  backBtn: { padding: spacing.s4 },
  headerTitle: {
    color: colors.primary,
    fontSize: 18,
    fontFamily: theme.typography.family.primary.bold,
  },
  listContent: {
    paddingHorizontal: spacing.s16,
    paddingBottom: spacing.s32,
  },
  emptyText: { color: colors.textSecondary, textAlign: 'center' },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.s16,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    padding: spacing.s12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sFull,
    backgroundColor: `${colors.primary}1F`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: theme.typography.family.primary.bold,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s4,
    marginTop: 4,
  },
  dateText: { color: colors.textSecondary, fontSize: 12 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s4,
    borderWidth: 1,
    borderRadius: borderRadius.sFull,
    paddingHorizontal: spacing.s8,
    paddingVertical: 4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: {
    fontSize: 10,
    fontFamily: theme.typography.family.primary.bold,
  },
  detailWrapper: { marginTop: spacing.s12 },
  detailDivider: {
    height: 1,
    backgroundColor: colors.midnight[700],
    marginBottom: spacing.s12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s8,
    marginBottom: spacing.s8,
  },
  detailLabel: { color: colors.textSecondary, fontSize: 12 },
  detailValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontFamily: theme.typography.family.primary.bold,
  },
  statusDetailBox: {
    borderWidth: 1,
    borderRadius: borderRadius.s8,
    padding: spacing.s12,
    marginTop: spacing.s4,
  },
  statusDetailTitle: {
    fontSize: 13,
    fontFamily: theme.typography.family.primary.bold,
    marginBottom: spacing.s4,
  },
  statusDetailText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  errorBanner: {
    marginHorizontal: spacing.s16,
    marginBottom: spacing.s16,
    backgroundColor: `${colors.red[500]}1A`,
    borderRadius: borderRadius.s8,
    borderWidth: 1,
    borderColor: colors.red[500],
    padding: spacing.s12,
  },
  errorText: { color: colors.red[400] },
});
