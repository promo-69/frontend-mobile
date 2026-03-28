const palette = {
  midnight: {
    50: '#F1EFF9',
    100: '#E7E3F4',
    200: '#CDC4E9',
    300: '#B6A9DF',
    400: '#A08ED4',
    500: '#8870C8',
    600: '#434344',
    700: '#5D419D',
    800: '#442E74',
    900: '#2E1E51',
    950: '#231640',
  },

  gold: {
    50: '#fef1e7',
    200: '#fcc891',
    100: '#fde4ce',
    300: '#f6ad38',
    400: '#d9982f',
    500: '#b27c25',
    600: '#8e621b',
    700: '#6c4912',
    800: '#4b320a',
    900: '#2a1a03',
    950: '#1d1102',
  },

  indigo: {
    50: '#F4F2FC',
    100: '#E6E3F9',
    200: '#D1CAF5',
    300: '#B9AEF0',
    400: '#A594EB',
    500: '#8F78E5',
    600: '#7C5EDE',
    700: '#683FD4',
    800: '#542FB1',
    900: '#3E2186',
    950: '#241153',
  },

  // Escala Lila (Acentos secundarios)
  lila: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#4E2551',
    900: '#2E1330',
    950: '#1C0A1E',
  },

  grey: {
    100: '#e6e9e6',
    200: '#c9cdc9',
    300: '#abafab',
    400: '#919491',
    50: '#f7f8f7',
    500: '#777a77',
    600: '#5f615f',
    700: '#484948',
    800: '#2f312f',
    900: '#1b1c1b',
    950: '#101110',
  },

  red: {
    100: '#fadfdf',
    200: '#f6bebe',
    300: '#f39c9c',
    400: '#f17676',
    50: '#fceded',
    500: '#ef4444',
    600: '#c52b2b',
    700: '#c52b2b',
    800: '#691212',
    900: '#400707',
    950: '#290303',
  },

  yellow: {
    50: '#fef1ec',
    100: '#fee6dd',
    200: '#fcc9b2',
    300: '#fcb086',
    400: '#fb923c',
    500: '#d37723',
    600: '#a75d19',
    700: '#7d440f',
    800: '#552d07',
    900: '#341903',
    950: '#220e01',
  },

  green: {
    100: '#71ffea',
    200: '#1dead4',
    300: '#19d2bd',
    400: '#14b8a6',
    50: '#c6fff4',
    500: '#109788',
    600: '#09786c',
    700: '#065a51',
    800: '#023c35',
    900: '#01221e',
    950: '#001714',
  },
};

export const COLORS = {
  // Exportamos los primitivos para uso directo
  ...palette,

  primary: palette.gold[400],
  secondary: palette.lila[500],
  background: palette.midnight[900],
  surface: palette.gold[500],

  textPrimary: palette.grey[50],
  textSecondary: palette.grey[400],
  textDisabled: palette.grey[50],

  border: palette.midnight[700],

  // Estados de acciones de usuario
  error: palette.red[500],
  success: palette.green[500],
  warning: palette.yellow[500],
  info: palette.indigo[300],

  // Gradientes configurados para expo-linear-gradient
  gradients: {
    //Gradiante de background de las pantallas (Vertical)
    bgColor: {
      colors: [palette.midnight[950], '#7B1A82', palette.midnight[950]],
      locations: [0.29, 0.64, 0.83],
      start: { x: 0.5, y: 0 },
      end: { x: 0.5, y: 1 },
    },

    //Gradiente Button Active (Vertical)
    btnDefault: {
      colors: [palette.gold[400], palette.gold[500]],
      locations: [0.45, 1.0], // 45% -> 100%
      start: { x: 0.5, y: 0 }, // Centro superior
      end: { x: 0.5, y: 1 }, // Centro inferior
    },

    //Gradiente Button Pressed (Diagonal)
    btnPressed: {
      colors: [palette.gold[200], palette.gold[400]],
      locations: [0, 1.0],
      start: { x: 0, y: 1 }, // Esquina inferior izquierda (Bottom-Left)
      end: { x: 1, y: 0 }, // Esquina superior derecha (Top-Right)
    },
  },
};
