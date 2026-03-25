import { StyleSheet, Text } from 'react-native';
import { theme } from '../constants/index';

export const AppText = ({ variant = 'body', style, children, ...props }) => {
  // Obtiene el estilo del tema basado en el variant
  const variantStyle =
    theme.typography.variants[variant] || theme.typography.variants.body;

  return (
    <Text
      style={[
        //Color y Fuente por defecto 
        {
          color: theme.colors.text.primary,
          fontFamily: theme.typography.family.primary.regular,
        },
        styles.base,
        //Sobrescribe la fuente base 
        variantStyle,
        //  Sobrescribe todo si pasa un style prop manual
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
