const variant = process.env.APP_VARIANT || '';

module.exports = {
  expo: {
    name: 'Cineflix',
    slug: 'cineflix-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './src/assets/images/icon.png',
    scheme: 'frontendmobile',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSSpeechRecognitionUsageDescription:
          'Allow $(PRODUCT_NAME) to use speech recognition.',
        NSMicrophoneUsageDescription:
          'Allow $(PRODUCT_NAME) to use the microphone.',
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#1A1230',
        foregroundImage: './src/assets/images/android-icon-foreground.png',
        backgroundImage: './src/assets/images/android-icon-bg.png',
        monochromeImage: './src/assets/images/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      package: `com.promo69.cineflixapp${variant}`,
      permissions: [
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
        'android.permission.MODIFY_AUDIO_SETTINGS',
      ],
    },
    web: {
      output: 'static',
      favicon: './src/assets/images/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './src/assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#1A1230',
          dark: {
            backgroundColor: '#F5F3FF',
          },
        },
      ],
      'expo-font',
      '@react-native-community/datetimepicker',
      'expo-web-browser',
      'expo-secure-store',
      [
        'expo-camera',
        {
          cameraPermission:
            'Permite el acceso a la cámara para escanear los códigos QR de los clientes en el control de entradas y confitería.',
        },
      ],
      'expo-speech-recognition',
      'expo-audio',
      'expo-asset',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '1306c7c8-4a95-48d9-8802-2975cf87801a',
      },
    },
    owner: 'prismca',
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {},
  },
};
