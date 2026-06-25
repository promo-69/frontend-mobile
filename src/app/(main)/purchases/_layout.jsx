import { Stack } from 'expo-router';
import { theme } from '../../../constants';

export default function PurchasesLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Mis Compras' }} />
      <Stack.Screen name="[orderId]" options={{ title: 'Detalle de Orden' }} />
    </Stack>
  );
}
