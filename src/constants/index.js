import { COLORS } from './colors';
import { SPACING } from './spacing';
import { FAMILY, LINEHEIGHT, SIZE, TEXT_VARIANTS } from './typography';

/*
  Theme Centralizado 
  Actúa como la única fuente para estilos en la aplicación.
 */
export const theme = {
  // Se expande COLORS y se añade el objeto semántico 'gradients'
  colors: {
    ...COLORS,
    // Gradientes predefinidos para ser usados con el componente LinearGradient
    gradients: {
      glowPurple: {
        colors: ['transparent', COLORS.background],
        locations: [0.4, 1],
      },
    },
  },

  spacing: SPACING,

  // Tipografía: Definición completa de familias, tamaños y alturas de línea
  typography: {
    family: FAMILY,
    size: SIZE,
    lineHeight: LINEHEIGHT,
    // Variantes (H1, Body, Caption) para uso directo
    variants: TEXT_VARIANTS,
  },

  borderRadius: {
    sm: 4, // Elementos pequeños
    md: 8, // Estándar para Botones e Inputs
    lg: 16, // Estándar para Contenedores
    xl: 24, // Modales grandes
    full: 9999, // Circular
  },
};

// Exporta las constantes directamente
export { COLORS, FAMILY, SPACING, TEXT_VARIANTS };

