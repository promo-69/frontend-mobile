import { Stack } from 'expo-router';
import { theme } from '../../../constants';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        animation: 'slide_from_bottom',
      }}
    >
      {/* Index es el menú principal con las tarjetas de opciones */}
      <Stack.Screen name="index" options={{ title: 'Mi Perfil' }} />

      {/* Pantalla de formulario de datos personales */}
      <Stack.Screen
        name="personal-data"
        options={{
          title: 'Datos Personales',
          gestureEnabled: true,
        }}
      />

      {/* Pantalla de cambio de credenciales / seguridad */}
      <Stack.Screen name="security/index" />

      {/* Módulo de fidelidad (CinePuntos): dashboard, historial y niveles */}
      <Stack.Screen name="loyalty-program" options={{ gestureEnabled: true }} />
    </Stack>
  );
}
