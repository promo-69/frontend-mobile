import { useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText } from '../AppText';
import { theme } from '../../constants';

const COLORS = {
  textMain: '#FFFFFF',
  textGray: '#B0A8C5',
  accent: '#f4b400',
  border: 'rgba(255, 255, 255, 0.12)',
};

/**
 * Normaliza el texto de un tipo de proyección a "2D" o "3D".
 */
export function normalizeFormat(text) {
  const upper = String(text || '').toUpperCase();
  if (upper.includes('3D')) return '3D';
  return '2D';
}

/**
 * Chips de filtro para la cartelera: formato de proyección (2D/3D) e idioma.
 * Las opciones se derivan de las funciones realmente disponibles, así nunca
 * se muestra un filtro que no tenga resultados.
 *
 * @param {Array} cinemasData - grupos { cinema, showtimes[] }
 * @param {string|null} selectedFormat
 * @param {string|null} selectedLanguage
 * @param {Function} onChangeFormat
 * @param {Function} onChangeLanguage
 */
export default function ShowtimeFilters({
  cinemasData,
  selectedFormat,
  selectedLanguage,
  onChangeFormat,
  onChangeLanguage,
}) {
  // Derivamos las opciones disponibles de los datos
  const { formats, languages } = useMemo(() => {
    const formatSet = new Set();
    const languageSet = new Set();
    (cinemasData || []).forEach((group) => {
      (group.showtimes || []).forEach((s) => {
        if (s.projection_type?.description) {
          formatSet.add(normalizeFormat(s.projection_type.description));
        }
        if (s.language?.description) {
          languageSet.add(s.language.description);
        }
      });
    });
    return {
      formats: Array.from(formatSet).sort(),
      languages: Array.from(languageSet).sort(),
    };
  }, [cinemasData]);

  // Si no hay variedad (un solo formato y un solo idioma), no mostramos filtros
  if (formats.length <= 1 && languages.length <= 1) return null;

  const Chip = ({ label, active, onPress }) => (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <AppText style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </AppText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {formats.length > 1 && (
        <View style={styles.group}>
          <AppText style={styles.groupLabel}>FORMATO</AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
          >
            <Chip
              label="Todos"
              active={!selectedFormat}
              onPress={() => onChangeFormat(null)}
            />
            {formats.map((f) => (
              <Chip
                key={f}
                label={f}
                active={selectedFormat === f}
                onPress={() => onChangeFormat(selectedFormat === f ? null : f)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {languages.length > 1 && (
        <View style={styles.group}>
          <AppText style={styles.groupLabel}>IDIOMA</AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
          >
            <Chip
              label="Todos"
              active={!selectedLanguage}
              onPress={() => onChangeLanguage(null)}
            />
            {languages.map((l) => (
              <Chip
                key={l}
                label={l}
                active={selectedLanguage === l}
                onPress={() =>
                  onChangeLanguage(selectedLanguage === l ? null : l)
                }
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16, gap: 12 },
  group: { gap: 8 },
  groupLabel: {
    color: COLORS.accent,
    fontSize: 11,
    fontFamily: theme.typography.family.primary.bold,
    letterSpacing: 0.6,
  },
  row: { gap: 8, paddingRight: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  chipActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(244, 180, 0, 0.16)',
  },
  chipText: { color: COLORS.textGray, fontSize: 13 },
  chipTextActive: {
    color: COLORS.accent,
    fontFamily: theme.typography.family.primary.bold,
  },
});
