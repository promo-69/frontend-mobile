import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { isEmployee } from '../helper/roles.helper';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomSheet from '../components/ui/BottomSheet';
import { AlertProvider } from '../context/AlertContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { BottomSheetProvider } from '../context/BottomSheetContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { theme } from '../constants';

SplashScreen.preventAutoHideAsync();

function NavigationGuard() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const employeeUser = isEmployee(user);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup  = segments[0] === '(auth)';
    const inMainGroup  = segments[0] === '(main)';
    const inBuyGroup   = segments[0] === '(buy)';
    const inStaffGroup = segments[0] === '(staff)';

    // Empleado autenticado fuera del stack de staff → redirigir al scanner
    if (isAuthenticated && employeeUser && !inStaffGroup) {
      router.replace('/(staff)/scanner');
      return;
    }

    // Tabs de (main) que requieren sesión
    const protectedTabs = ['profile', 'purchases'];
    const isAccessingProtectedTab =
      inMainGroup && protectedTabs.includes(segments[1]);

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(main)/home');
    }

    if (!isAuthenticated && (isAccessingProtectedTab || inBuyGroup)) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, segments, employeeUser]);

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
      <Stack.Screen name="(staff)" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="(legal)" options={{ animation: 'slide_from_right' }} />
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
    if (Platform.OS !== 'android') return;
    StatusBar.setBackgroundColor(theme.colors.background.accent);
    StatusBar.setBarStyle('light-content');
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <BottomSheetProvider>
              <AlertProvider>
                <NavigationGuard />
                <BottomSheet />
              </AlertProvider>
            </BottomSheetProvider>
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
