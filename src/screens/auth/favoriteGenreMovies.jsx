import { StyleSheet, View } from 'react-native';
import { AppText } from '../../components/AppText';
import { GenreChip } from '../../components/ui/GenreChip';
import { theme } from '../../constants';

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

export default function FavoriteGenreMovies({ 
  value = [], 
  onChange, 
  error 
}) {

   const handleSubmit = () => {
    // Aquí puedes enviar los géneros seleccionados al backend
    console.log('Géneros seleccionados:', value);
    router.replace('/(main)/home'); // Redirige al home
  };

  const handleSkip = () => {
    router.replace('/(main)/home'); // Redirige al home sin enviar datos
  };

 const handleToggle = (genre) => {
    const isSelected = value.includes(genre);
    const nextGenres = isSelected
      ? value.filter(g => g !== genre)
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

       <View style={styles.buttonContainer}>
        <CustomButton
          title="Enviar"
          onPress={handleSubmit}
          style={styles.submitButton}
        />
        <CustomButton
          title="Saltar"
          onPress={handleSkip}
          style={[styles.skipButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.primary }]}
        />
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
  buttonContainer: {
    marginTop: theme.spacing.s24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitButton: {
    flex: 1,
    marginRight: theme.spacing.s8,
  },
  skipButton: {
    flex: 1,
    marginLeft: theme.spacing.s8,
  },
});