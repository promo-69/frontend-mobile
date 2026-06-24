import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function ContentLayout() {
  return (
    <>
      {/* Forzamos que la barra de estado del teléfono sea blanca/clara para el fondo oscuro */}
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: '#231640' },
          animation: 'slide_from_right',

          headerTransparent: true,

          headerTitle: '',

          headerBackIcon: () => null,
        }}
      >
        {/* Definimos explícitamente la pantalla dinámica para asegurar el mapeo */}
        <Stack.Screen
          name="[movieId]"
          options={{
            headerShown: true,
          }}
        />
      </Stack>
    </>
  );
}
