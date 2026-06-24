import { TouchableOpacity, StyleSheet } from 'react-native';
import { AppText } from '../AppText';
import { theme } from '../../constants';

/**
 * GenreChip Component
 * @param {string} label - El nombre del género a mostrar
 * @param {boolean} isSelected - Estado de selección
 * @param {function} onPress - Acción al tocar el chip
 * @param {object} style - Estilos adicionales permitidos desde el padre
 */
export const GenreChip = ({ label, isSelected, onPress, style }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.chipContainer, isSelected && styles.chipSelected, style]}
    >
      <AppText style={[styles.label, isSelected && styles.labelSelected]}>
        {label}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chipContainer: {
    paddingVertical: theme.spacing.s12,
    paddingHorizontal: theme.spacing.s16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: theme.colors.lila[100],
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: theme.colors.lila[100],
    borderColor: theme.colors.lila[300],
  },
  label: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  labelSelected: {
    color: theme.colors.midnight[500],
    fontWeight: 'bold',
  },
});
