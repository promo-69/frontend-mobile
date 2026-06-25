import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { CalendarClock, ChevronLeft } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppText } from '../../../components/AppText';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { theme } from '../../../constants';
import { getMyRentalRequests } from '../../../services/info.service';

const { colors, spacing, borderRadius } = theme;

// Mapa de estados → etiqueta y color (RENTAL_STATUS del backend)
const STATUS_MAP = {
  1: { label: 'En revisión', color: colors.warning },
  2: { label: 'Pendiente de pago', color: colors.info },
  3: { label: 'Pagado', color: colors.success },
  4: { label: 'Rechazado', color: colors.error },
  5: { label: 'Cancelado', color: colors.textDisabled },
};

const formatDateTime = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
};

function RequestRow({ item }) {
  const statusId = item.status?.id ?? item.status;
  const status = STATUS_MAP[statusId] ?? {
    label: item.status?.description ?? 'Desconocido',
    color: colors.textDisabled,
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardIcon}>
        <CalendarClock size={20} color={colors.primary} />
      </View>
      <View style={styles.cardBody}>
        <AppText style={styles.cardTitle} numberOfLines={1}>
          {item.event_name}
        </AppText>
        <AppText style={styles.cardDate}>
          {formatDateTime(item.requested_start_time)}
        </AppText>
      </View>
      <View style={[styles.statusPill, { borderColor: status.color }]}>
        <View style={[styles.statusDot, { backgroundColor: status.color }]} />
        <AppText style={[styles.statusText, { color: status.color }]}>
          {status.label}
        </AppText>
      </View>
    </View>
  );
}

export default function RentalRequestsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getMyRentalRequests();
      const rows = Array.isArray(data) ? data : (data?.rows ?? []);
      setRequests(rows);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
    <ScreenWrapper>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={26} color={colors.primary} />
        </TouchableOpacity>
        <AppText style={styles.topBarTitle}>Mis solicitudes</AppText>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <AppText style={styles.errorText}>
            No pudimos cargar tus solicitudes.
          </AppText>
          <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
            <AppText style={styles.retryBtnText}>Reintentar</AppText>
          </TouchableOpacity>
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.center}>
          <AppText style={styles.emptyEmoji}>🎬</AppText>
          <AppText style={styles.emptyText}>
            Aún no tienes solicitudes de alquiler.
          </AppText>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => router.push('/cinemas/rental')}
          >
            <AppText style={styles.newBtnText}>Solicitar un alquiler</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item, i) => String(item.id ?? i)}
          renderItem={({ item }) => <RequestRow item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: spacing.s8 }} />}
        />
      )}
    </ScreenWrapper>
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
    fontFamily: theme.typography.family.primary.bold,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.s12,
    paddingHorizontal: spacing.s24,
  },
  errorText: { color: colors.textSecondary, fontSize: 15 },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.s24,
    paddingVertical: spacing.s12,
    borderRadius: borderRadius.s8,
  },
  retryBtnText: {
    color: colors.textBlack,
    fontFamily: theme.typography.family.primary.bold,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: theme.typography.family.primary.bold,
    textAlign: 'center',
  },
  newBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.s24,
    paddingVertical: spacing.s12,
    borderRadius: borderRadius.s8,
    marginTop: spacing.s8,
  },
  newBtnText: {
    color: colors.textBlack,
    fontFamily: theme.typography.family.primary.bold,
  },
  listContent: {
    paddingHorizontal: spacing.s16,
    paddingBottom: spacing.s32,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s12,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.s16,
    padding: spacing.s12,
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(246,173,56,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 2 },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: theme.typography.family.primary.bold,
  },
  cardDate: { color: colors.textSecondary, fontSize: 12 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s4,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: spacing.s8,
    paddingVertical: spacing.s4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: {
    fontSize: 11,
    fontFamily: theme.typography.family.primary.bold,
  },
});
