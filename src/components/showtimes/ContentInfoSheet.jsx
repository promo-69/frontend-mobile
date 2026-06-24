import { StyleSheet, Text, View } from 'react-native';
import { formatHumanDate } from '../../utils/dateUtils';

const COLORS = {
  textMain: '#FFFFFF',
  textGray: '#B0A8C5',
  infoSheetBg: 'rgba(35, 22, 64, 0.7)',
  border: 'rgba(255, 255, 255, 0.1)',
  accent: '#f4b400',
};

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
          <Text style={[styles.infoValue, { color: COLORS.accent }]}>
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
  // Contenedor principal de la ficha
  infoSheet: {
    backgroundColor: COLORS.infoSheetBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 25,
    overflow: 'hidden',
  },
  // Estructuras de filas y columnas
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
  // Bordes divisores internos
  infoBorderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  infoBorderTop: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  // Tipografías y etiquetas
  infoLabel: {
    color: COLORS.textGray,
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoValue: {
    color: COLORS.textMain,
    fontSize: 13,
    fontWeight: '600',
  },
});
