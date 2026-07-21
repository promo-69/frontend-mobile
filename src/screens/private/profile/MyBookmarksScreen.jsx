import { useRouter } from 'expo-router';
import {
  Bookmark,
  BookmarkMinus,
  CalendarDays,
  CheckSquare,
  ListChecks,
  Square,
  Ticket,
  Trash2,
} from 'lucide-react-native';
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
import { AppAlert } from '../../../components/ui/AppAlert';
import { AppText } from '../../../components/ui/AppText';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { theme } from '../../../constants';
import { usersService } from '../../../services/users.service';

const { colors, spacing, borderRadius } = theme;

// lifecycle_state = 1 → preventa activa (ver movie-reminders.task.ts del backend)
const PRESALE_STATE = 1;

const formatReleaseDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('es-VE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Mis subscripciones: lista de películas "Próximamente" a las que el usuario se
 * suscribió para recibir alertas de estreno/preventa. Permite desmarcarlas
 * individualmente o en lote.
 */
export default function MyBookmarksScreen() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Modo lote
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);

  // Suscripción pendiente de confirmar su eliminación (individual)
  const [confirmTarget, setConfirmTarget] = useState(null);
  // Confirmación de eliminación en lote
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);
  // Aviso simple: { title, message } (éxito o error)
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await usersService.getMyMovieSubscriptions();
      const list = Array.isArray(data) ? data : (data?.rows ?? []);
      setItems(list.filter((s) => s?._Movies));
    } catch (err) {
      console.error('Error al cargar subscripciones:', err);
      setNotice({
        title: 'Error',
        message: 'No pudimos cargar tus subscripciones. Intenta de nuevo.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  // ─── Modo lote ───────────────────────────────────────────────────────────

  const handleToggleBatchMode = () => {
    setIsBatchMode((prev) => !prev);
    setSelectedIds([]);
  };

  const handleToggleSelect = (movieId) => {
    setSelectedIds((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId]
    );
  };

  const handleToggleSelectAll = () => {
    const allMovieIds = items.map((s) => s._Movies?.id).filter(Boolean);
    if (selectedIds.length === allMovieIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allMovieIds);
    }
  };

  const confirmDeleteBatch = async () => {
    setShowBatchConfirm(false);
    setIsDeletingBatch(true);
    const previous = items;
    const count = selectedIds.length;

    // UI optimista
    setItems((prev) => prev.filter((s) => !selectedIds.includes(s._Movies?.id)));
    setSelectedIds([]);
    setIsBatchMode(false);

    try {
      await usersService.unsubscribeFromMoviesBatch(selectedIds);
      setNotice({
        title: 'Subscripciones eliminadas',
        message: `Se eliminaron ${count} subscripciones.`,
      });
    } catch (err) {
      console.error('Error al eliminar subscripciones en lote:', err);
      setItems(previous);
      setNotice({
        title: 'Error',
        message: 'No pudimos eliminar las subscripciones. Intenta de nuevo.',
      });
    } finally {
      setIsDeletingBatch(false);
    }
  };

  // ─── Eliminación individual ──────────────────────────────────────────────

  const handleUnsubscribe = (subscription) => setConfirmTarget(subscription);

  const confirmRemoval = async () => {
    if (!confirmTarget || removing) return;
    const subscription = confirmTarget;
    const movie = subscription._Movies;
    const previous = items;

    setRemoving(true);
    setItems((prev) => prev.filter((s) => s.id !== subscription.id));
    try {
      await usersService.unsubscribeFromMovie(movie.id);
      setConfirmTarget(null);
      setNotice({
        title: 'Subscripción eliminada',
        message: `Ya no recibirás alertas de "${movie.title}".`,
      });
    } catch (err) {
      console.error('Error al quitar subscripción:', err);
      setItems(previous);
      setConfirmTarget(null);
      setNotice({
        title: 'Error',
        message: 'No pudimos quitar la subscripción. Intenta de nuevo.',
      });
    } finally {
      setRemoving(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  const renderItem = ({ item }) => {
    const movie = item._Movies;
    const inPresale = movie.lifecycle_state === PRESALE_STATE;
    const release = formatReleaseDate(movie.release_date);
    const isSelected = selectedIds.includes(movie.id);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isBatchMode && styles.cardBatch,
          isBatchMode && isSelected && styles.cardSelected,
        ]}
        activeOpacity={0.8}
        onPress={() => {
          if (isBatchMode) {
            handleToggleSelect(movie.id);
          } else {
            router.push(`/content/${movie.id}`);
          }
        }}
      >
        {isBatchMode && (
          <View style={styles.checkboxOverlay}>
            {isSelected ? (
              <CheckSquare size={22} color={colors.primary} strokeWidth={2.5} />
            ) : (
              <Square size={22} color={colors.textSecondary} strokeWidth={1.5} />
            )}
          </View>
        )}

        {movie.poster_url ? (
          <Image
            source={{ uri: movie.poster_url }}
            style={[styles.poster, isBatchMode && !isSelected && styles.posterDimmed]}
          />
        ) : (
          <View style={[styles.poster, styles.posterFallback, isBatchMode && !isSelected && styles.posterDimmed]}>
            <Bookmark size={22} color={colors.textDisabled} />
          </View>
        )}

        <View style={[styles.info, isBatchMode && !isSelected && styles.infoDimmed]}>
          <AppText style={styles.title} numberOfLines={2}>
            {movie.title}
          </AppText>

          {inPresale ? (
            <View style={[styles.badge, styles.badgePresale]}>
              <Ticket size={12} color={colors.midnight[950]} />
              <AppText style={styles.badgePresaleText}>
                ¡Preventa disponible!
              </AppText>
            </View>
          ) : (
            <View style={styles.badge}>
              <CalendarDays size={12} color={colors.textSecondary} />
              <AppText style={styles.badgeText}>
                {release ? `Estreno: ${release}` : 'Próximamente'}
              </AppText>
            </View>
          )}
        </View>

        {!isBatchMode && (
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => handleUnsubscribe(item)}
            disabled={removing}
            hitSlop={8}
          >
            <BookmarkMinus size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Barra de controles del modo lote */}
      {items.length > 0 && (
        <View style={styles.batchBar}>
          {!isBatchMode ? (
            <TouchableOpacity
              style={styles.batchToggleBtn}
              onPress={handleToggleBatchMode}
              activeOpacity={0.7}
            >
              <ListChecks size={16} color={colors.primary} />
              <AppText style={styles.batchToggleText}>Seleccionar en lote</AppText>
            </TouchableOpacity>
          ) : (
            <View style={styles.batchControls}>
              <TouchableOpacity
                style={styles.batchSelectAllBtn}
                onPress={handleToggleSelectAll}
                activeOpacity={0.7}
              >
                {selectedIds.length === items.length ? (
                  <CheckSquare size={16} color={colors.primary} />
                ) : (
                  <Square size={16} color={colors.primary} />
                )}
                <AppText style={styles.batchSelectAllText}>
                  {selectedIds.length === items.length ? 'Deseleccionar' : 'Seleccionar todo'}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.batchDeleteBtn,
                  selectedIds.length === 0 && styles.batchDeleteBtnDisabled,
                ]}
                onPress={() => setShowBatchConfirm(true)}
                disabled={selectedIds.length === 0 || isDeletingBatch}
                activeOpacity={0.7}
              >
                <Trash2 size={16} color={selectedIds.length === 0 ? colors.textDisabled : '#FFFFFF'} />
                <AppText
                  style={[
                    styles.batchDeleteText,
                    selectedIds.length === 0 && styles.batchDeleteTextDisabled,
                  ]}
                >
                  Eliminar ({selectedIds.length})
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.batchCancelBtn}
                onPress={handleToggleBatchMode}
                activeOpacity={0.7}
              >
                <AppText style={styles.batchCancelText}>Cancelar</AppText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={
          items.length === 0 ? styles.emptyContainer : styles.listContainer
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Bookmark size={44} color={colors.textDisabled} />
            <AppText style={styles.emptyTitle}>
              No tienes subscripciones activas
            </AppText>
            <AppText style={styles.emptyText}>
              Suscríbete a una película de "Próximamente" y te avisaremos cuando su
              preventa esté disponible o el estreno esté cerca.
            </AppText>
            <TouchableOpacity
              style={styles.emptyCta}
              onPress={() => router.push('/home/upcoming')}
              activeOpacity={0.8}
            >
              <AppText style={styles.emptyCtaText}>
                Explorar próximos estrenos
              </AppText>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Confirmación de eliminación individual */}
      <AppAlert
        visible={!!confirmTarget}
        variant="danger"
        icon={BookmarkMinus}
        title="Quitar subscripción"
        message={
          confirmTarget
            ? `¿Dejar de recibir alertas de "${confirmTarget._Movies?.title}"?`
            : ''
        }
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        loading={removing}
        onConfirm={confirmRemoval}
        onCancel={() => !removing && setConfirmTarget(null)}
      />

      {/* Confirmación de eliminación en lote */}
      <AppAlert
        visible={showBatchConfirm}
        variant="danger"
        icon={Trash2}
        title="Eliminar subscripciones"
        message={`¿Estás seguro de que deseas eliminar las ${selectedIds.length} subscripciones seleccionadas? Dejarás de recibir alertas sobre sus estrenos.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loading={isDeletingBatch}
        onConfirm={confirmDeleteBatch}
        onCancel={() => !isDeletingBatch && setShowBatchConfirm(false)}
      />

      {/* Aviso simple (éxito o error) */}
      <AppAlert
        visible={!!notice}
        icon={Bookmark}
        title={notice?.title}
        message={notice?.message}
        confirmLabel="Entendido"
        onConfirm={() => setNotice(null)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContainer: { padding: spacing.s16, gap: spacing.s12 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },

  // ─── Batch bar ──────────────────────────────────────────────────────────
  batchBar: {
    paddingHorizontal: spacing.s16,
    paddingTop: spacing.s12,
    paddingBottom: spacing.s4,
  },
  batchToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.s8,
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s8,
    borderRadius: 10,
    backgroundColor: `${colors.primary}14`,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  batchToggleText: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: theme.typography.family.primary.bold,
  },
  batchControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s8,
    flexWrap: 'wrap',
  },
  batchSelectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s8,
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s8,
    borderRadius: 10,
    backgroundColor: `${colors.primary}14`,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  batchSelectAllText: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: theme.typography.family.primary.bold,
  },
  batchDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s8,
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s8,
    borderRadius: 10,
    backgroundColor: colors.error,
  },
  batchDeleteBtnDisabled: {
    backgroundColor: `${colors.error}30`,
  },
  batchDeleteText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: theme.typography.family.primary.bold,
  },
  batchDeleteTextDisabled: {
    color: colors.textDisabled,
  },
  batchCancelBtn: {
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  batchCancelText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: theme.typography.family.primary.bold,
  },

  // ─── Card ───────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s16,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    padding: spacing.s12,
    gap: spacing.s12,
  },
  cardBatch: {
    paddingRight: spacing.s16,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  checkboxOverlay: {
    position: 'absolute',
    top: spacing.s12,
    right: spacing.s12,
    zIndex: 10,
  },
  poster: {
    width: 52,
    height: 76,
    borderRadius: borderRadius.s8,
    backgroundColor: colors.midnight[700],
  },
  posterDimmed: {
    opacity: 0.4,
  },
  posterFallback: { alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: spacing.s8 },
  infoDimmed: { opacity: 0.4 },
  title: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: theme.typography.family.primary.bold,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.s4,
    paddingHorizontal: spacing.s8,
    paddingVertical: 3,
    borderRadius: borderRadius.sFull,
    backgroundColor: colors.midnight[700],
  },
  badgeText: { color: colors.textSecondary, fontSize: 12 },
  badgePresale: { backgroundColor: colors.gold[400] },
  badgePresaleText: {
    color: colors.midnight[950],
    fontSize: 12,
    fontFamily: theme.typography.family.primary.bold,
  },
  removeBtn: { padding: spacing.s8 },

  // ─── Empty state ────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.s32,
    gap: spacing.s12,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: theme.typography.family.primary.bold,
    marginTop: spacing.s8,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyCta: {
    marginTop: spacing.s8,
    backgroundColor: colors.gold[400],
    borderRadius: borderRadius.sFull,
    paddingHorizontal: spacing.s24,
    paddingVertical: spacing.s12,
  },
  emptyCtaText: {
    color: colors.midnight[950],
    fontSize: 14,
    fontFamily: theme.typography.family.primary.bold,
  },
});
