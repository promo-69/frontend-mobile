import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Animated,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native'; // Importamos los iconos necesarios
import { theme } from '../../constants';

/**
 * @param {string} label - Texto que flota al enfocar o escribir.
 * @param {React.ReactNode} rightIcon - Icono opcional a la derecha (si no es password).
 * @param {boolean} secureTextEntry - Indica si es un campo de contraseña.
 * @param {string} error - Mensaje de error para activar el estado visual rojo.
 * @param {import('react-native').ViewStyle} style - Estilos para el contenedor.
 */
export const Input = ({
  label,
  rightIcon,
  secureTextEntry,
  error,
  style,
  value,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Estado para alternar visibilidad si es password
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const labelStyle = {
    position: 'absolute',
    left: theme.spacing.s4,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [14, -12],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.typography.size.s16, theme.typography.size.s12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [
        error ? theme.colors.error : theme.colors.textSecondary,
        error ? theme.colors.error : theme.colors.primary,
      ],
    }),
    fontFamily:
      isFocused || value
        ? theme.typography.family.primary.semiBold
        : theme.typography.variants.body,
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError, // Borde rojo si hay error
        ]}
      >
        <Animated.Text style={labelStyle}>{label}</Animated.Text>

        <TextInput
          style={[
            theme.typography.variants.body,
            styles.input,
            { color: theme.colors.textPrimary },
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          placeholder=""
          selectionColor={theme.colors.primary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...textInputProps}
          accessibilityLabel={label} // Añadido para que getByLabelText funcione
        />

        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.iconContainer}
            activeOpacity={0.7}
          >
            {isPasswordVisible ? (
              <Eye size={20} color={theme.colors.primary} />
            ) : (
              <EyeOff size={20} color={theme.colors.textSecondary} />
            )}
          </TouchableOpacity>
        ) : (
          rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>
        )}
      </View>

      {/* Mensaje de error micro bajo el input */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: theme.spacing.s16,
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
  inputContainerError: {
    borderBottomColor: theme.colors.error,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingTop: 8,
  },
  iconContainer: {
    marginLeft: theme.spacing.s8,
    padding: 4,
  },
  errorText: {
    color: theme.colors.error,
    ...theme.typography.variants.caption,
    marginTop: theme.spacing.s4,
    minHeight: 16,
  },
});
