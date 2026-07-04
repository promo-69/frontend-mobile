import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../constants';
import { formatHumanDate } from '../../utils/dateUtils';

const formatGenres = (genres) => {
  if (!Array.isArray(genres) || genres.length === 0) return 'Especial';
  const cleanGenres = genres
    .map((g) => g?._Genres?.description)
    .filter(Boolean);
  return cleanGenres.length > 0 ? cleanGenres.join(', ') : 'Especial';
};

export default function ContentInfoSheet({ contentInfo, type }) {
  return (
    <View style={styles.infoSheet}>
      {/* FILA 1: DURACIÓN Y CLASIFICACIÓN */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>DURACIÓN</Text>
          <Text style={styles.infoValue}>
            {contentInfo.duration_minutes
              ? `${contentInfo.duration_minutes} min`
              : 'N/A'}
          </Text>
        </View>
        <View style={[styles.infoItem, styles.infoBorderLeft]}>
          <Text style={styles.infoLabel}>CLASIFICACIÓN</Text>
          <Text style={styles.infoValue}>
            {contentInfo.age_classification?.description || 'Apto todo público'}
          </Text>
        </View>
      </View>

      {/* FILA 2: FECHA DINÁMICA Y ESTADO */}
      <View style={[styles.infoRow, styles.infoBorderTop]}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>
            {type === 'event' ? 'FECHA EVENTO' : 'ESTRENO'}
          </Text>
          <Text style={styles.infoValue}>
            {formatHumanDate(contentInfo.release_date) || 'No definida'}
          </Text>
        </View>
        <View style={[styles.infoItem, styles.infoBorderLeft]}>
          <Text style={styles.infoLabel}>ESTADO</Text>
          <Text style={[styles.infoValue, { color: theme.colors.textAccent.gold }]}>
            {contentInfo.lifecycle_state?.description || 'Activo'}
          </Text>
        </View>
      </View>

      {/* FILA 3: CATEGORÍAS / GÉNEROS */}
      <View style={[styles.infoRow, styles.infoBorderTop]}>
        <View style={styles.infoItemFull}>
          <Text style={styles.infoLabel}>CATEGORÍA / GÉNEROS</Text>
          <Text style={styles.infoValue}>
            {type === 'event'
              ? 'Evento Especial Cineflix'
              : formatGenres(contentInfo.genres)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoSheet: {
    backgroundColor: 'rgba(35, 22, 64, 0.7)',
    borderRadius: theme.borderRadius.s16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 25,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoItem: {
    flex: 1,
    padding: 15,
  },
  infoItemFull: {
    flex: 1,
    padding: 15,
  },
  infoBorderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoBorderTop: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoLabel: {
    color: theme.colors.textDisabled,
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoValue: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
});
