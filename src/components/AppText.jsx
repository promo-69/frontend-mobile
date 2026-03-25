import { StyleSheet, Text } from 'react-native';
import { theme } from '../constants/index';

export const AppText = ({ variant = 'body', style, children, ...props }) => {
  // Obtenemos el estilo del tema basado en el variant
  const variantStyle =
    theme.typography.variants[variant] || theme.typography.variants.body;

  return (
    <Text
      style={[
        // 1. Base: Color y Fuente por defecto (para que se vea en Dark Mode)
        {
          color: theme.colors.text.primary,
          fontFamily: theme.typography.family.primary.regular,
        },
        styles.base,
        // 2. Variante: Sobrescribe la fuente base (ej. pone Bold en títulos)
        variantStyle,
        // 3. Custom: Sobrescribe todo si pasas un style prop manual
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    textAlignVertical: 'center',
  },
});
