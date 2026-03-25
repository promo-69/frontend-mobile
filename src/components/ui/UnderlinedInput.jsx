import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { theme } from '../../constants';
import { AppText } from '../AppText';

export const UnderlinedInput = ({ label, style, ...textInputProps }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // El color del borde inferior cambia si el input está enfocado
  const underlineColor = isFocused
    ? theme.colors.primary
    : theme.colors.grey[100];

  return (
    <View style={[styles.container, style]}>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
      <TextInput
        style={[styles.input, { borderBottomColor: underlineColor }]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholderTextColor={theme.colors.text.secondary}
        cursorColor={theme.colors.primary} // Color del cursor consistente con el tema
        {...textInputProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    ...theme.typography.variants.body,
    color: theme.colors.text.primary,
    borderBottomWidth: 1,
    paddingBottom: theme.spacing.sm,
    height: 40, // Altura estándar para inputs
  },
});
