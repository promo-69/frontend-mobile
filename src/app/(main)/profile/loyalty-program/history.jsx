import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppText } from '../../../../components/AppText';
import { ScreenWrapper } from '../../../../components/ScreenWrapper';
import { LoyaltyTransactionItem } from '../../../../components/loyalty/LoyaltyTransactionItem';
import { useLoyalty } from '../../../../hooks/loyalty/useLoyalty';
import { theme } from '../../../../constants';

const { colors, spacing, borderRadius } = theme;

export default function LoyaltyHistoryScreen() {
  const router = useRouter();
  const {
    transactions,
    loading,
    loadingMore,
    hasMoreTransactions,
    loadMoreTransactions,
    error,
    refresh,
  } = useLoyalty({ withTransactions: true });

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={26} color={colors.primary} />
        </TouchableOpacity>
        <AppText variant="h3" style={styles.headerTitle}>Historial</AppText>
        <View style={{ width: 34 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item, idx) => String(item.id ?? idx)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <LoyaltyTransactionItem transaction={item} />}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          onEndReachedThreshold={0.4}
          onEndReached={loadMoreTransactions}
          ListEmptyComponent={
            <View style={styles.centered}>
              <AppText variant="body" style={styles.emptyText}>
                Todavía no tienes movimientos de CinePuntos.
              </AppText>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.s16 }} />
            ) : null
          }
        />
      )}

      {error && (
        <TouchableOpacity onPress={refresh} style={styles.errorBanner}>
          <AppText variant="caption" style={styles.errorText}>
            {error} Toca para reintentar.
          </AppText>
        </TouchableOpacity>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: spacing.s48 },
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
    color: colors.textPrimary,
    fontFamily: theme.typography.family.primary.bold,
  },
  listContent: {
    paddingHorizontal: spacing.s16,
    paddingBottom: spacing.s32,
  },
  divider: { height: 1, backgroundColor: colors.midnight[700] },
  emptyText: { color: colors.textSecondary, textAlign: 'center' },
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
