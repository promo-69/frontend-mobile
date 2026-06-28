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
        animation: 'slide_from_bottom', // Animación nativa fluida de derecha a izquierda
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

      

      {/* Mis solicitudes de alquiler de salas */}
      <Stack.Screen name="rental-requests" options={{ gestureEnabled: true }} />
      
      <Stack.Screen name="my-genres" />
    </Stack>
  );
}
