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
