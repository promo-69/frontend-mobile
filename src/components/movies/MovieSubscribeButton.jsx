import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Bell, BellRing } from 'lucide-react-native';
import { AppText } from '../AppText';
import { useMovieSubscription } from '../../hooks/movies/useMovieSubscription';
import { theme } from '../../constants';

const { colors, spacing, borderRadius } = theme;

/**
 * Botón de "Recibir alerta de estreno" para películas en estado Próximamente.
 * Solo debe renderizarse cuando el usuario está autenticado y la película
 * @param {Object} props
 * @param {number|string} props.movieId
 */
export function MovieSubscribeButton({ movieId }) {
  const { isSubscribed, loading, toggling, toggle } =
    useMovieSubscription(movieId);

  const handlePress = async () => {
    try {
      await toggle();
    } catch (err) {
      Alert.alert(
        'No se pudo actualizar tu suscripción',
        err?.response?.data?.message || 'Intenta de nuevo en unos momentos.'
      );
    }
  };

  if (loading) {
    return (
      <TouchableOpacity style={[styles.button, styles.buttonNeutral]} disabled>
        <ActivityIndicator size="small" color={colors.textSecondary} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSubscribed ? styles.buttonActive : styles.buttonNeutral,
      ]}
      onPress={handlePress}
      disabled={toggling}
      activeOpacity={0.8}
    >
      {toggling ? (
        <ActivityIndicator
          size="small"
          color={isSubscribed ? colors.green[400] : colors.primary}
        />
      ) : isSubscribed ? (
        <BellRing size={18} color={colors.green[400]} />
      ) : (
        <Bell size={18} color={colors.primary} />
      )}
      <AppText
        variant="smallText"
        style={[
          styles.text,
          isSubscribed ? styles.textActive : styles.textNeutral,
        ]}
      >
        {isSubscribed
          ? 'Te avisaremos del estreno'
          : 'Recibir alerta de estreno'}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s8,
    borderRadius: borderRadius.sFull,
    borderWidth: 1.5,
    paddingVertical: spacing.s12,
    paddingHorizontal: spacing.s16,
  },
  buttonNeutral: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}14`,
  },
  buttonActive: {
    borderColor: colors.green[400],
    backgroundColor: `${colors.green[400]}14`,
  },
  text: {
    fontFamily: theme.typography.family.primary.bold,
  },
  textNeutral: { color: colors.primary },
  textActive: { color: colors.green[400] },
});
