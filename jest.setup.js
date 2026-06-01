// 1. Definir variables globales que Expo espera encontrar
global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
global.__ExpoImportMetaRegistry = {};

// 2. Bloquear el motor Winter
process.env.EXPO_USE_WINTER_RUNTIME = '0';

// 3. Mock de Expo
jest.mock('expo', () => {
  const actual = jest.requireActual('expo');
  return {
    ...actual,
    __ExpoImportMetaRegistry: {},
  };
});

// 4. Mock de expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useNavigation: jest.fn(() => ({
    canGoBack: jest.fn(() => true),
  })),
}));

// 5. Mock de expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: View,
  };
});

// 6. Mock de @react-native-async-storage/async-storage
// Esto es crucial para evitar el error "NativeModule: AsyncStorage is null"
// y permite que `storage.helper.js` (o cualquier otro componente que lo use)
// funcione en Jest.
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve(null)),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null)),
  clear: jest.fn(() => Promise.resolve(null)),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve(null)),
  multiRemove: jest.fn(() => Promise.resolve(null)),
}));
