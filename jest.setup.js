// 1. Definir variables globales que Expo espera encontrar
global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
global.__ExpoImportMetaRegistry = {};
import { Animated } from 'react-native';

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

jest.mock('./src/services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  },
}));

// 8. Mock de Animaciones para evitar errores de act(...)
// Esto hace que todas las animaciones se ejecuten instantáneamente
jest.spyOn(Animated, 'timing').mockImplementation(() => ({
  start: (callback) => callback && callback({ finished: true }),
  stop: () => {},
}));