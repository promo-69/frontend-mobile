import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';

SplashScreen.preventAutoHideAsync();

function NavigationGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
      if (isLoading) return;

      // Grupos de rutas
      const inAuthGroup = segments[0] === '(auth)';
      const inMainGroup = segments[0] === '(main)';

      //Si el usuario se loguea y está en Login/Register, mandarlo a Home
      if (isAuthenticated && inAuthGroup) {
        router.replace('/(main)/home');
      } 
      
      //Si el usuario no está logueado e intenta entrar a una zona privada
      const isPrivateSection = segments[1] === 'profile';
      if (!isAuthenticated && isPrivateSection) {
        router.replace('/(auth)/login');
      }

    }, [isAuthenticated, isLoading, segments]);

    return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(main)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(auth)" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="index" options={{ href: null }} />
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
      <AuthProvider>
        <SafeAreaProvider>
          <NavigationGuard />
        </SafeAreaProvider>
      </AuthProvider>
  );
}
