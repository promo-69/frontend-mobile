import { View, StyleSheet, Text } from 'react-native';
import { MapPin, CalendarX } from 'lucide-react-native';
import { theme } from '../../constants';
import ShowtimeCard from './ShowtimeCard';
import { normalizeFormat } from './ShowtimeFilters';

export default function ShowtimesList({
  cinemasData,
  showtimesData,
  contentId,
  type,
  selectedFormat = null,
  selectedLanguage = null,
}) {
  // Aplicamos los filtros activos sobre las funciones de cada cine.
  // Los cines que queden sin funciones tras el filtro no se muestran.
  const filteredCinemas = (cinemasData || [])
    .map((group) => {
      const showtimes = (group.showtimes || []).filter((s) => {
        const formatOk =
          !selectedFormat ||
          normalizeFormat(s.projection_type?.description) === selectedFormat;
        const languageOk =
          !selectedLanguage || s.language?.description === selectedLanguage;
        return formatOk && languageOk;
      });
      return { ...group, showtimes };
    })
    .filter((group) => group.showtimes.length > 0);

  // Estado vacío: ninguna sucursal tiene funciones (con o sin filtro)
  if (!filteredCinemas || filteredCinemas.length === 0) {
    const hasFilters = selectedFormat || selectedLanguage;
    return (
      <View style={styles.emptyContainer}>
        <CalendarX size={44} color={theme.colors.textDisabled} strokeWidth={1.5} />
        <Text style={styles.emptyText}>
          {hasFilters
            ? 'No hay funciones que coincidan con los filtros seleccionados.'
            : 'No hay funciones programadas para este día.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {filteredCinemas.map((cinemaGroup) => (
        <View key={cinemaGroup.cinema.id} style={styles.cinemaCard}>
          {/* Renderizado de la información del Cinema */}
          <View style={styles.cinemaHeader}>
            <MapPin size={18} color={theme.colors.textAccent.gold} />
            <Text style={styles.cinemaName}>{cinemaGroup.cinema.name}</Text>
          </View>

          {/* Grid envolvente con la inyección dinámica del tipo de contenido */}
          <View style={styles.hoursGrid}>
            {cinemaGroup.showtimes?.map((showtime) => (
              <ShowtimeCard
                key={showtime.id}
                showtime={showtime}
                contentId={contentId}
                type={type}
                cinemaId={cinemaGroup.cinema.id}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: { width: '100%', marginBottom: 30 },
  cinemaCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: theme.borderRadius.s16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: theme.spacing.s16,
    marginBottom: 16,
  },
  cinemaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 8,
  },
  cinemaName: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: '700' },
  hoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
  },
  emptyContainer: {
    width: '100%',
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: theme.borderRadius.s16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderStyle: 'dashed',
    marginBottom: 30,
    gap: 12,
  },
  emptyText: {
    color: theme.colors.textDisabled,
    fontSize: theme.typography.size.s14,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
