import { StyleSheet, View } from 'react-native';
import { theme } from '../constants';
import { AppText } from './ui/AppText';
import { GenreChip } from './ui/GenreChip';

/**
 * @param {string[]} selectedGenres - Array de géneros elegidos.
 * @param {function} onToggleGenre - Función para marcar/desmarcar.
 * @param {string|null} error - Mensaje de error si no cumple el mínimo.
 */

const AVAILABLE_GENRES = [
  'Musical',
  'Animada',
  'Comedia',
  'Acción',
  'Aníme',
  'Aventura',
  'Terror',
  'Drama',
  'Historias',
  'Suspenso',
  'Adulto',
  'Biografía',
  'Deportes',
  'Ficción',
];

export const GenreSelectionStep = ({ value = [], onChange, error }) => {
  const handleToggle = (genre) => {
    const isSelected = value.includes(genre);
    const nextGenres = isSelected
      ? value.filter((g) => g !== genre)
      : [...value, genre];
    onChange(nextGenres);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="h2" style={styles.title}>
          ¿Qué géneros te gustan?
        </AppText>

        {error ? (
          <AppText style={styles.errorText}>{error}</AppText>
        ) : (
          <AppText variant="body" style={styles.subtitle}>
            Selecciona al menos 3 categorías
          </AppText>
        )}
      </View>

      <View style={styles.grid}>
        {AVAILABLE_GENRES.map((genre) => (
          <GenreChip
            key={genre}
            label={genre}
            isSelected={value.includes(genre)}
            onPress={() => handleToggle(genre)}
            style={styles.chipItem}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.s24,
  },
  title: {
    textAlign: 'center',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.s8,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.s16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.s12,
  },
  chipItem: {
    width: '48%',
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: theme.typography.family.primary.semiBold,
    fontSize: theme.typography.variants.label.fontSize,
    textAlign: 'center',
    marginTop: theme.spacing.s16,
  },
});
