import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

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
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        
        <Stack.Screen name="(auth)"/>

        {/* Grupo de la App Principal (Tabs) */}
        {/* <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} /> */}
      </Stack>
    </SafeAreaProvider>
    </ThemeProvider>
  );
}
