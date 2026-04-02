import { View, StyleSheet, ScrollView } from 'react-native';
import { GenreChip } from './ui/GenreChip';
import { AppText } from './AppText';
import { theme } from '../constants';

/**
 * @param {string[]} selectedGenres - Array de géneros elegidos.
 * @param {function} onToggleGenre - Función para marcar/desmarcar.
 * @param {string|null} error - Mensaje de error si no cumple el mínimo.
 */

const AVAILABLE_GENRES = [
  "Musical", "Animada", "Comedia", "Acción", 
  "Aníme", "Aventura", "Terror", "Drama", 
  "Historias", "Suspenso", "Adulto", "Biografía", 
  "Deportes", "Ficción"
];

export const GenreSelectionStep = ({ 
  selectedGenres = [], 
  onToggleGenre, 
  error = null 
}) => {
  return (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <AppText variant="h2" style={styles.title}>
          ¿Qué géneros te gustan?
        </AppText>
        
        {/* Renderizado condicional del mensaje de error*/}
        {error ? (
          <AppText style={styles.errorText}>
            {error}
          </AppText>
        ) : (
          <AppText variant="body" style={styles.subtitle}>
            Selecciona tus categorías favoritas
          </AppText>
        )}
      </View>

      <View style={styles.grid}>
        {AVAILABLE_GENRES.map((genre) => (
          <GenreChip
            key={genre}
            label={genre}
            isSelected={selectedGenres.includes(genre)}
            onPress={() => onToggleGenre(genre)}
            style={styles.chipItem}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: theme.spacing.s32,
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