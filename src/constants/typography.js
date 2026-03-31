//Definición de Alias
export const FONTS = {
  primary: {
    regular: 'MainRegular',
    medium: 'MainMedium',
    semiBold: 'MainSemiBold',
    bold: 'MainBold',
  },
  secondary: 'DisplayRegular',
};

// Escala de tamaños (Basada en 8pt y pasos medios)
export const SIZE = {
  s10: 10, //Captions/Labels
  s12: 12, //Cuerpo pequeño
  s14: 14,
  s16: 16, //Cuerpo base / Inputs
  s18: 18, //Títulos de cards
  s20: 20, //Subtitulos
  s24: 24, //Títulos secundarios
  s32: 32, // H2
  s36: 36, //
  s48: 48,
};

//Variantes semánticas para diferentes usos de texto
export const TEXT_VARIANTS = {
  h1: {
    fontFamily: FONTS.secondary,
    fontSize: SIZE.s48,
  },
  h2: {
    fontFamily: FONTS.primary.bold,
    fontSize: SIZE.s32,
  },
  subtitle: {
    fontFamily: FONTS.primary.medium,
    fontSize: SIZE.s20,
  },
  body: {
    fontFamily: FONTS.primary.regular,
    fontSize: SIZE.s16,
  },
  button: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: SIZE.s16,
  },
  smallText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: SIZE.s14,
  },
  label: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: SIZE.s12,
  },
  caption: {
    fontFamily: FONTS.primary.regular,
    fontSize: SIZE.s10,
  },
};
