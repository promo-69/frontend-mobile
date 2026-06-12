import { COLORS } from './colors';
import { SPACING } from './spacing';
import { FONTS, LINEHEIGHT, SIZE, TEXT_VARIANTS } from './typography';

export const theme = {
  // Se expande COLORS y se añade el objeto semántico 'gradients'
  colors: {
    ...COLORS,
  },

  spacing: SPACING,

  // Tipografía: Definición completa de familias, tamaños y alturas de línea
  typography: {
    family: FONTS,
    size: SIZE,
    lineHeight: LINEHEIGHT,
    // Variantes (H1, Body, Caption) para uso directo
    variants: TEXT_VARIANTS,
  },

  borderRadius: {
    s4: 4, // Elementos pequeños
    s8: 8, // Estándar para Botones e Inputs
    s16: 16, // Estándar para Contenedores
    s24: 24, // Modales grandes
    sFull: 9999, // Circular
  },
};

// Exporta las constantes directamente
export { COLORS, FONTS, SIZE, SPACING, TEXT_VARIANTS };
