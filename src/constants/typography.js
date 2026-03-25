//Contiene la familias, pesos y escalas de tamaño


//Definición de Alias 
export const FAMILY = {
  primary: {
    regular: 'MainRegular',
    medium: 'MainMedium',
    semiBold: 'MainSemiBold',
    bold: 'MainBold',
  },
  display: 'DisplayRegular', 
};

// Escala de tamaños (Basada en 8pt y pasos medios)
export const SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  huge: 48,
};

export const LINEHEIGHT = {
      xs: 16,
      sm: 20,
      md: 24, 
      lg: 32, 
      xl: 40,
};

//Variantes semánticas para diferentes usos de texto
export const TEXT_VARIANTS = {
  h1: {
    fontFamily: FAMILY.display,
    fontSize: SIZE.huge,
    letterSpacing: 1,
  },
  h2: {
    fontFamily: FAMILY.primary.bold,
    fontSize: SIZE.xl,
    lineHeight: LINEHEIGHT.lg,
  },
  subtitle: {
    fontFamily: FAMILY.primary.medium,
    fontSize: SIZE.lg,
  },
  body: {
    fontFamily: FAMILY.primary.regular,
    fontSize: SIZE.md,
    lineHeight: LINEHEIGHT.md,
  },
  label: {
    fontFamily: FAMILY.primary.semiBold,
    fontSize: SIZE.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  caption: {
    fontFamily: FAMILY.primary.regular,
    fontSize: SIZE.xs,
    opacity: 0.7,
  }
};