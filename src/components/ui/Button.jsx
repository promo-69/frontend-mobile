import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/index';
import { AppText } from '../AppText';

export const ActionButton = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
}) => {

  const isDisabled = disabled || isLoading;

  const buttonStyle = variant === 'primary' ? theme.colors.primary : styles.outline;

  // Selecciona el color del texto
  const textColor = variant === 'primary' ? theme.colors.text.primary : theme.colors.inverse;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7} 
      style={[styles.base, buttonStyle, isDisabled && styles.disabled, style]}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <AppText variant="label" style={{ color: textColor }}>
          {title}
        </AppText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.grey[600],
  },
});
