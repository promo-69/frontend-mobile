module.exports = {
  preset: 'jest-expo',
  setupFiles: [],
  setupFilesAfterEnv: [
    './jest.setup.js',
    '@testing-library/jest-native/extend-expect',
  ],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node',
    'native.ts',
    'native.tsx',
    'native.js',
  ],
  moduleNameMapper: {
    '^expo$': '<rootDir>/node_modules/expo',
    'expo/src/winter/runtime.native': 'identity-obj-proxy',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@react-native-community/datetimepicker|@expo/.*)',
  ],
};
