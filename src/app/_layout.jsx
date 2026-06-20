import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomSheet from '../components/ui/BottomSheet';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { BottomSheetProvider } from '../context/BottomSheetContext';
import { CartProvider } from '../context/CartContext';

SplashScreen.preventAutoHideAsync();

function NavigationGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inMainGroup = segments[0] === '(main)';
    const inBuyGroup = segments[0] === '(buy)';

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
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(main)" options={{ animation: 'fade' }} />
      <Stack.Screen
        name="(auth)"
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="movie" />
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
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <CartProvider>
        <BottomSheetProvider>
          <SafeAreaProvider>
            <NavigationGuard />
            <BottomSheet />
          </SafeAreaProvider>
        </BottomSheetProvider>
      </CartProvider>
    </AuthProvider>
  );
}
