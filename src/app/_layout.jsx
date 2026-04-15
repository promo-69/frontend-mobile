import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../services/AuthContext';

SplashScreen.preventAutoHideAsync();

function NavigationGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isInsideProfile = segments[1] === 'profile';

    if (isAuthenticated && inAuthGroup) {
      // Si está autenticado y trata de ir a login, redirigir a home
      router.replace('/(home)/homemain');
    } else if (!isAuthenticated && isInsideProfile) {
      // Si cierra sesión estando en el perfil, lo mandamos al home público
      router.replace('/(home)/homemain');
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(home)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    MainBold: require('../assets/fonts/Montserrat-Bold.ttf'),
    MainRegular: require('../assets/fonts/Montserrat-Regular.ttf'),
    MainSemiBold: require('../assets/fonts/Montserrat-SemiBold.ttf'),
    MainMedium: require('../assets/fonts/Montserrat-Medium.ttf'),
    DisplayRegular: require('../assets/fonts/BebasNeue-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={DarkTheme}>
      <AuthProvider>
        <SafeAreaProvider>
          <NavigationGuard />
        </SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
