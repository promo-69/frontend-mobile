import { useRouter } from 'expo-router';
import { Bookmark, BookmarkMinus, CalendarDays, Ticket } from 'lucide-react-native';
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
 * Mis marcadores: lista de películas "Próximamente" a las que el usuario se
 * suscribió para recibir alertas de estreno/preventa. Permite desmarcarlas
 * directamente desde aquí sin buscar en el feed.
 */
export default function MyBookmarksScreen() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removing, setRemoving] = useState(false);
  // Suscripción pendiente de confirmar su eliminación (abre el AppAlert de confirmación)
  const [confirmTarget, setConfirmTarget] = useState(null);
  // Aviso simple: { title, message } (éxito o error)
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await usersService.getMyMovieSubscriptions();
      // El repo puede devolver un array plano o { rows, count } según filtros.
      const list = Array.isArray(data) ? data : (data?.rows ?? []);
      setItems(list.filter((s) => s?._Movies));
    } catch (err) {
      console.error('Error al cargar marcadores:', err);
      setNotice({
        title: 'Error',
        message: 'No pudimos cargar tus marcadores. Intenta de nuevo.',
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

  // Abre el diálogo de confirmación (AppAlert) para una suscripción.
  const handleUnsubscribe = (subscription) => setConfirmTarget(subscription);

  // Confirmación aceptada: elimina con UI optimista y revierte si falla.
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
      // Confirmación visual tras cancelar (criterio 3 de HU-33).
      setNotice({
        title: 'Marcador eliminado',
        message: `Ya no recibirás alertas de "${movie.title}".`,
      });
    } catch (err) {
      console.error('Error al quitar marcador:', err);
      setItems(previous);
      setConfirmTarget(null);
      setNotice({
        title: 'Error',
        message: 'No pudimos quitar el marcador. Intenta de nuevo.',
      });
    } finally {
      setRemoving(false);
    }
  };

  const renderItem = ({ item }) => {
    const movie = item._Movies;
    const inPresale = movie.lifecycle_state === PRESALE_STATE;
    const release = formatReleaseDate(movie.release_date);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push(`/content/${movie.id}`)}
      >
        {movie.poster_url ? (
          <Image source={{ uri: movie.poster_url }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.posterFallback]}>
            <Bookmark size={22} color={colors.textDisabled} />
          </View>
        )}

        <View style={styles.info}>
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

        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleUnsubscribe(item)}
          disabled={removing}
          hitSlop={8}
        >
          <BookmarkMinus size={20} color={colors.textSecondary} />
        </TouchableOpacity>
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
              No tienes películas marcadas
            </AppText>
            <AppText style={styles.emptyText}>
              Marca una película de “Próximamente” y te avisaremos cuando su
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

      {/* Confirmación de eliminación, con la estética de la app */}
      <AppAlert
        visible={!!confirmTarget}
        variant="danger"
        icon={BookmarkMinus}
        title="Quitar marcador"
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
  poster: {
    width: 52,
    height: 76,
    borderRadius: borderRadius.s8,
    backgroundColor: colors.midnight[700],
  },
  posterFallback: { alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: spacing.s8 },
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
