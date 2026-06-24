import { useRouter } from 'expo-router';
import { ArrowDownLeft, ArrowUpRight, ChevronLeft } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppText } from '../../../../components/AppText';
import { ScreenWrapper } from '../../../../components/ScreenWrapper';
import { theme } from '../../../../constants';
import { usersService } from '../../../../services/users.service';

const { colors, spacing, borderRadius } = theme;

const formatDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('es-VE', {
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

// Un movimiento puede traer el tipo de operación en _OperationTypes.is_increment
function isCredit(item) {
  const op = item._OperationTypes || item.operation_type_detail;
  if (op && typeof op.is_increment === 'boolean') return op.is_increment;
  // Respaldo: si no viene la relación, asumimos crédito (los puntos siempre son > 0)
  return true;
}

function LedgerRow({ item }) {
  const credit = isCredit(item);
  const points = Number(item.points ?? 0);
  const op = item._OperationTypes || item.operation_type_detail;
  const label =
    op?.description || (credit ? 'Puntos ganados' : 'Puntos usados');
  const orderId = item._Orders?.id ?? item.order ?? null;

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: credit
              ? 'rgba(74,222,128,0.14)'
              : 'rgba(239,68,68,0.14)',
          },
        ]}
      >
        {credit ? (
          <ArrowDownLeft size={18} color={colors.success} />
        ) : (
          <ArrowUpRight size={18} color={colors.error} />
        )}
      </View>
      <View style={styles.rowTexts}>
        <AppText style={styles.rowLabel} numberOfLines={1}>
          {label}
        </AppText>
        <AppText style={styles.rowDate}>
          {formatDate(item.created_at || item.createdAt)}
          {orderId ? `  ·  Orden #${orderId}` : ''}
        </AppText>
        {item.remarks ? (
          <AppText style={styles.rowRemarks} numberOfLines={1}>
            {item.remarks}
          </AppText>
        ) : null}
      </View>
      <View style={styles.rowRight}>
        <AppText
          style={[
            styles.rowPoints,
            { color: credit ? colors.success : colors.error },
          ]}
        >
          {credit ? '+' : '−'}
          {points.toLocaleString('es-VE')}
        </AppText>
        <AppText style={styles.rowBalance}>
          Saldo: {Number(item.points_balance ?? 0).toLocaleString('es-VE')}
        </AppText>
      </View>
    </View>
  );
}

export default function LoyaltyHistoryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ledgers, setLedgers] = useState([]);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await usersService.getLoyaltyLedgers({ limit: 100 });
      // El backend puede devolver { rows, count } o un array directo
      const rows = Array.isArray(data) ? data : (data?.rows ?? []);
      setLedgers(rows);
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
        <AppText style={styles.topBarTitle}>Historial de puntos</AppText>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <AppText style={styles.errorText}>
            No pudimos cargar tu historial.
          </AppText>
          <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
            <AppText style={styles.retryBtnText}>Reintentar</AppText>
          </TouchableOpacity>
        </View>
      ) : ledgers.length === 0 ? (
        <View style={styles.center}>
          <AppText style={styles.emptyEmoji}>🪙</AppText>
          <AppText style={styles.emptyText}>
            Aún no tienes movimientos de puntos.
          </AppText>
          <AppText style={styles.emptySub}>
            Gana CinePuntos con cada compra que realices.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={ledgers}
          keyExtractor={(item, i) => String(item.id ?? i)}
          renderItem={({ item }) => <LedgerRow item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    color: colors.midnight[950],
    fontFamily: theme.typography.family.primary.bold,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: theme.typography.family.primary.bold,
    textAlign: 'center',
  },
  emptySub: { color: colors.textSecondary, fontSize: 13, textAlign: 'center' },
  listContent: {
    paddingHorizontal: spacing.s16,
    paddingBottom: spacing.s32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s12,
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    padding: spacing.s12,
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTexts: { flex: 1, gap: 2 },
  rowLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: theme.typography.family.primary.bold,
  },
  rowDate: { color: colors.textSecondary, fontSize: 11 },
  rowRemarks: {
    color: colors.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
  },
  rowRight: { alignItems: 'flex-end', gap: 2 },
  rowPoints: {
    fontSize: 15,
    fontFamily: theme.typography.family.primary.bold,
  },
  rowBalance: { color: colors.textSecondary, fontSize: 10 },
  separator: { height: spacing.s8 },
});
