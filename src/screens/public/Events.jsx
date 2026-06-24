import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MovieGridCard from '../../components/movies/MovieGridCard'; 
import { getEvents } from '../../services/events.service'; 
import { theme } from '../../constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // Grid de 2 columnas con espaciado

export default function Events() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await getEvents();
        const eventsData = Array.isArray(response) ? response : [];

        const processedEvents = eventsData.map(event => ({
          ...event,
          title: event.title || event.name, 
          type: event.type || 'special_event',
          isEvent: true
        }));

        setUpcomingEvents(processedEvents);
      } catch (error) {
        console.error("Error cargando los próximos eventos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  const getEventsGroupedByMonth = () => {
    if (!Array.isArray(upcomingEvents) || upcomingEvents.length === 0) return {};

    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    return upcomingEvents.reduce((groups, event) => {
      const eventDate = event.release_date || event.date;

      if (!eventDate) {
        const unknownKey = 'Por Confirmar';
        if (!groups[unknownKey]) groups[unknownKey] = [];
        groups[unknownKey].push(event);
        return groups;
      }

      const parts = eventDate.split('-');
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1; 

      if (monthIndex >= 0 && monthIndex < 12) {
        const formattedMonth = `${months[monthIndex]} ${year}`;
        if (!groups[formattedMonth]) groups[formattedMonth] = [];
        groups[formattedMonth].push(event);
      } else {
        const unknownKey = 'Por Confirmar';
        if (!groups[unknownKey]) groups[unknownKey] = [];
        groups[unknownKey].push(event);
      }
      return groups;
    }, {});
  };

  const groupedEvents = getEventsGroupedByMonth();

  const monthsDirectory = {
    "Enero": 0, "Febrero": 1, "Marzo": 2, "Abril": 3, "Mayo": 4, "Junio": 5,
    "Julio": 6, "Agosto": 7, "Septiembre": 8, "Octubre": 9, "Noviembre": 10, "Diciembre": 11
  };

  const monthsOrder = Object.keys(groupedEvents).sort((a, b) => {
    if (a === 'Por Confirmar') return 1;
    if (b === 'Por Confirmar') return -1;

    const partsA = a.split(' ');
    const partsB = b.split(' ');

    const monthA = monthsDirectory[partsA[0]];
    const yearA = parseInt(partsA[1], 10);
    const monthB = monthsDirectory[partsB[0]];
    const yearB = parseInt(partsB[1], 10);

    return new Date(yearA, monthA, 1) - new Date(yearB, monthB, 1);
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Cargando próximos eventos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Próximos <Text style={styles.headerTitleAccent}>Eventos</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Explora las funciones especiales, festivales y eventos exclusivos que están por llegar. ¡Disfruta de experiencias únicas en Cineflix!
          </Text>
        </View>

        {monthsOrder.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No hay eventos especiales programados en este momento.
            </Text>
          </View>
        ) : (
          monthsOrder.map((month) => (
            <View key={month} style={styles.sectionContainer}>
              
              {/* Título del month */}
              <View style={styles.monthRow}>
                <Text style={styles.monthTitle}>{month}</Text>
                <View style={styles.monthLine} />
              </View>

              {/* Grid de Eventos */}
              <View style={styles.grid}>
                {groupedEvents[month].map((event, index) => (
                  <View key={`event-${event.id || index}`} style={styles.cardWrapper}>
                    <MovieGridCard movie={event} isEventsPage={true} />
                  </View>
                ))}
              </View>

            </View>
          ))
        )}
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
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
  sectionContainer: {
    marginBottom: 32,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginHorizontal: 8,
    marginBottom: 16,
  },
});