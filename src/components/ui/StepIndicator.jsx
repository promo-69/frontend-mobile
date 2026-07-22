import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants';

/**
 * StepIndicator - Visualizador de progreso para el registro.
 * @param {number} currentStep - Índice del paso actual (0, 1, 2).
 * @param {number} totalSteps - Cantidad total de pasos.
 */
export const StepIndicator = ({ currentStep, totalSteps = 3 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index <= currentStep;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              isActive ? styles.dotActive : styles.dotInactive,
              index === totalSteps - 1 && { marginRight: 0 },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.s16,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: theme.borderRadius.s4,
    marginRight: theme.spacing.s8,
  },
  dotActive: {
    width: 8,
    backgroundColor: theme.colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: theme.colors.textDisabled,
    opacity: 0.3,
  },
});
