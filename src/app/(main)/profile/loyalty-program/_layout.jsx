import { Stack } from 'expo-router';
import { theme } from '../../../../constants';

export default function LoyaltyLayout() {
  return (
    <Stack
      screenOptions={{
        // Estilo global para el header nativo si decides usarlo (opcional)
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        animation: 'slide_from_bottom',
      }}
    >
      {/* Dashboard (Nivel, barra de progreso, balance)*/}

      <Stack.Screen name="index" options={{ title: 'CinePuntos' }} />

      {/*Historial contable (LoyaltyLedgers de la API)*/}
      <Stack.Screen name="history" options={{ title: 'Historial' }} />

      {/**Catálogo de canje por puntos (Combos bloqueados/desbloqueados) */}
      <Stack.Screen name="rewards" options={{ title: 'Premios' }} />
    </Stack>
  );
}
