import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../../constants';

export const Input = ({ label, rightIcon, style, ...textInputProps }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[theme.typography.variants.label, styles.label]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
        ]}
      >
        <TextInput
          style={[
            theme.typography.variants.body,
            styles.input,
            { color: theme.colors.textPrimary },
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={theme.colors.textSecondary}
          cursorColor={theme.colors.primary}
          {...textInputProps}
        />
        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.s4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border,
    backgroundColor: 'transparent',
    paddingHorizontal: theme.spacing.s4,
  },
  inputContainerFocused: {
    borderBottomColor: theme.colors.primary,
  },
  input: {
    flex: 1,
    height: '100%',
  },
  iconContainer: {
    marginLeft: theme.spacing.s8,
  },
});
