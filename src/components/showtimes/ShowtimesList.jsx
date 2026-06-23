import { View, StyleSheet, Text } from 'react-native';
import { MapPin, CalendarX } from 'lucide-react-native';
import ShowtimeCard from './ShowtimeCard'; 

const COLORS = {
  textMain: '#FFFFFF',
  textGray: '#B0A8C5',
  accent: '#f4b400',
  cardBg: 'rgba(255, 255, 255, 0.04)',
  border: 'rgba(255, 255, 255, 0.08)',
};

export default function ShowtimesList({ cinemasData, showtimesData, contentId, type }) {
  
  // Estado vacío: Si ninguna sucursal tiene funciones asignadas para este día
  if (!cinemasData || cinemasData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <CalendarX size={44} color={COLORS.textGray} strokeWidth={1.5} />
        <Text style={styles.emptyText}>
          No hay funciones programadas para este día.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {cinemasData.map((cinemaGroup) => (
        <View key={cinemaGroup.cinema.id} style={styles.cinemaCard}>
          
          {/* Renderizado de la información del Cinema */}
          <View style={styles.cinemaHeader}>
            <MapPin size={18} color={COLORS.accent} />
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
  cinemaCard: { backgroundColor: COLORS.cardBg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 16 },
  cinemaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 8 },
  cinemaName: { color: COLORS.textMain, fontSize: 15, fontWeight: '700' },
  hoursGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12,
    justifyContent: 'flex-start'
  },
  emptyContainer: { width: '100%', paddingVertical: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.cardBg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', marginBottom: 30, gap: 12 },
  emptyText: { color: COLORS.textGray, fontSize: 14, fontWeight: '500', textAlign: 'center', paddingHorizontal: 20 },
});