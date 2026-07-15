// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const reactNative = require('eslint-plugin-react-native');
const prettier = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,

  {
    plugins: {
      'react-native': reactNative,
    },

    rules: {
      // React Native 
      'react-native/no-inline-styles': 'warn',
      'react-native/no-unused-styles': 'warn',

    },
  },

  prettier,

  {
    ignores: ['dist/*'],
  },
]);
