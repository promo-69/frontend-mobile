import { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MovieGridCard from '../../components/movies/MovieGridCard';
import { getEvents } from '../../services/events.service';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '../../constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const MONTHS_DIRECTORY = {
  "Enero": 0, "Febrero": 1, "Marzo": 2, "Abril": 3, "Mayo": 4, "Junio": 5,
  "Julio": 6, "Agosto": 7, "Septiembre": 8, "Octubre": 9, "Noviembre": 10, "Diciembre": 11
};

export default function Events() {
  const router = useRouter();
  const {
    items: events,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    load,
    loadMore,
    refresh,
  } = usePaginatedList(getEvents);

  useEffect(() => {
    load(1);
  }, []);

  const processedEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];
    return events.map(event => ({
      ...event,
      title: event.title || event.name,
      type: event.type || 'special_event',
      isEvent: true,
    }));
  }, [events]);

  const groupedEvents = useMemo(() => {
    if (processedEvents.length === 0) return {};

    return processedEvents.reduce((groups, event) => {
      const eventDate = event.release_date || event.date;

      if (!eventDate) {
        const key = 'Por Confirmar';
        if (!groups[key]) groups[key] = [];
        groups[key].push(event);
        return groups;
      }

      const parts = eventDate.split('-');
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;

      if (monthIndex >= 0 && monthIndex < 12) {
        const key = `${MONTHS[monthIndex]} ${year}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(event);
      } else {
        const key = 'Por Confirmar';
        if (!groups[key]) groups[key] = [];
        groups[key].push(event);
      }
      return groups;
    }, {});
  }, [processedEvents]);

  const monthsOrder = useMemo(() => {
    return Object.keys(groupedEvents).sort((a, b) => {
      if (a === 'Por Confirmar') return 1;
      if (b === 'Por Confirmar') return -1;

      const partsA = a.split(' ');
      const partsB = b.split(' ');

      const monthA = MONTHS_DIRECTORY[partsA[0]];
      const yearA = parseInt(partsA[1], 10);
      const monthB = MONTHS_DIRECTORY[partsB[0]];
      const yearB = parseInt(partsB[1], 10);

      return new Date(yearA, monthA, 1) - new Date(yearB, monthB, 1);
    });
  }, [groupedEvents]);

  const flatData = useMemo(() => {
    const result = [];
    monthsOrder.forEach(month => {
      result.push({ _type: 'header', month, _key: `header-${month}` });
      const items = groupedEvents[month];
      for (let i = 0; i < items.length; i += 2) {
        const pair = items.slice(i, i + 2);
        result.push({
          _type: 'row',
          items: pair,
          _key: `row-${month}-${i}`,
        });
      }
    });
    return result;
  }, [monthsOrder, groupedEvents]);

  const renderFlatItem = useCallback(({ item }) => {
    if (item._type === 'header') {
      return (
        <View style={styles.monthRow}>
          <Text style={styles.monthTitle}>{item.month}</Text>
          <View style={styles.monthLine} />
        </View>
      );
    }

    return (
      <View style={styles.cardRow}>
        {item.items.map((event, index) => (
          <View key={`event-${event.id || index}`} style={styles.cardWrapper}>
            <MovieGridCard
              movie={event}
              isEventsPage={true}
              onPress={() => {
                router.push({
                  pathname: `/content/${event.id}`,
                  params: {
                    movieId: event.id,
                    type: 'special_event',
                  },
                });
              }}
            />
          </View>
        ))}
      </View>
    );
  }, [router]);

  const renderHeader = () => (
    <>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft color="white" size={22} strokeWidth={1} />
      </TouchableOpacity>
      <View style={styles.header}>
      <Text style={styles.headerTitle}>
        Próximos <Text style={styles.headerTitleAccent}>Eventos</Text>
      </Text>
      <Text style={styles.headerSubtitle}>
        Explora las funciones especiales, festivales y eventos exclusivos que están por llegar. ¡Disfruta de experiencias únicas en Cineflix!
      </Text>
      </View>
    </>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No hay eventos especiales programados en este momento.
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.accent} />
      </View>
    );
  };

  if (loading && events.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Cargando próximos eventos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={flatData}
        renderItem={renderFlatItem}
        keyExtractor={(item) => item._key}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        onEndReached={hasMore ? loadMore : null}
        onEndReachedThreshold={0.3}
        refreshing={refreshing}
        onRefresh={refresh}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#231640',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#231640',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#D1D5DB',
    fontSize: 14,
    marginTop: 12,
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 999,
    marginBottom: 16,
  },
  header: {
    borderLeftWidth: 4,
    borderLeftColor: '#F6AD38',
    paddingLeft: 12,
    marginBottom: 32,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  headerTitleAccent: {
    color: '#F6AD38',
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  emptyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  monthTitle: {
    color: '#F6AD38',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginRight: 12,
  },
  monthLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginHorizontal: 8,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
