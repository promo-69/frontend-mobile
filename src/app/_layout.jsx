import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomSheet from '../components/ui/BottomSheet';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { BottomSheetProvider } from '../context/BottomSheetContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { theme } from '../constants';

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
    const inBuyGroup = segments[0] === '(buy)';

    // Definir qué rutas dentro de (main) requieren autenticación
    const protectedTabs = ['profile', 'purchases'];
    const isAccessingProtectedTab =
      inMainGroup && protectedTabs.includes(segments[1]);

    // Si el usuario se loguea y está en Login/Register, mandarlo a Home
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(main)/home');
    }

    // Si el usuario no está logueado e intenta entrar a una zona privada
    if (!isAuthenticated && (isAccessingProtectedTab || inBuyGroup)) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(main)" options={{ animation: 'fade' }} />
      <Stack.Screen
        name="(auth)"
        options={{ animation: 'slide_from_bottom' }}
      />
      {/* Registramos el grupo de películas y el flujo de compra */}
      <Stack.Screen name="content" />
      <Stack.Screen name="(buy)" />
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
    if (Platform.OS === 'android') {
      // Sincroniza la barra de botones de Android con el color del Tab Bar
      NavigationBar.setBackgroundColorAsync(theme.colors.background.accent);
      NavigationBar.setButtonStyleAsync('light'); // Iconos claros para fondo oscuro
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
    <AuthProvider>
      <CartProvider>
        <BottomSheetProvider>
          
            <NavigationGuard />
            <BottomSheet />
          
        </BottomSheetProvider>
      </CartProvider>
    </AuthProvider>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
