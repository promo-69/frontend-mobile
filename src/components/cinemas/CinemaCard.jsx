import { StyleSheet, Text, View } from 'react-native';
import { MapPin, Phone, Clock, Building2 } from 'lucide-react-native';


export default function CinemaCard({ cinema }) {
  // Formateador simple para quitar los segundos de los strings de tiempo (01:00:00 -> 01:00)
  const formatTime = (time) => (time ? time.substring(0, 5) : '--:--');

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Building2 size={20} color="#FFC864" style={styles.titleIcon} />
        <Text style={styles.name} numberOfLines={1}>
          {cinema.name}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <MapPin size={16} color="#B0A8C5" />
          <Text style={styles.addressText}>{cinema.address}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.infoRow}>
            <Phone size={14} color="#B0A8C5" />
            <Text style={styles.detailText}>{cinema.phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Clock size={14} color="#B0A8C5" />
            <Text style={styles.detailText}>
              {formatTime(cinema.opening_time)} - {formatTime(cinema.closing_time)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#442F6B', // COLORS.headerBg para consistencia
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 100, 0.1)', // Sutil borde dorado
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(176, 168, 197, 0.1)',
    paddingBottom: 8,
  },
  titleIcon: {
    marginRight: 8,
  },
  name: {
    color: '#FFC864', // COLORS.accent
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  content: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  addressText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  detailText: {
    color: '#B0A8C5',
    fontSize: 13,
  },
});