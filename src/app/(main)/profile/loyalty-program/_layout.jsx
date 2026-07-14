import { Stack } from 'expo-router';
import { theme } from '../../../../constants';

export default function LoyaltyProgramLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      {/* Dashboard de CinePuntos (saldo + progreso + accesos) */}
      <Stack.Screen name="index" />
      {/* Catálogo de premios canjeables */}
      <Stack.Screen name="catalog" options={{ gestureEnabled: true }} />
      {/* Historial de movimientos de puntos */}
      <Stack.Screen name="history" options={{ gestureEnabled: true }} />
      {/* Niveles del programa */}
      <Stack.Screen name="rewards" options={{ gestureEnabled: true }} />
    </Stack>
  );
}
