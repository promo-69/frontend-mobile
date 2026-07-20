import { Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '../../../constants';

export default function ProfileLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{

        headerStyle: {
          marginTop: 12,
          backgroundColor: '#231640',
        },
        headerTintColor: theme.colors.accent,
        headerTitleStyle: {
          fontFamily: theme.typography.family.primary.bold,
          fontSize: 18,
          textTransform: 'uppercase',
        },
        headerShadowVisible: false,
        headerStatusBarHeight: 35,
        headerTitleAlign: 'center',

        headerLeft: () => (
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(main)/home');
              }
            }}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.buttonPressed
            ]}
            hitSlop={15}
          >
            <ArrowLeft size={22} color={theme.colors.accent} strokeWidth={1} />
          </Pressable>
        ),
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
      <Stack.Screen name="security/index"
      options={{
          title: 'Cambio de Contraseña'
        }}
      />

      <Stack.Screen name="bookmarks" options={{
        title: 'Mis marcadores',
        gestureEnabled: true }} />

      {/* Mis solicitudes de alquiler de salas */}
      <Stack.Screen name="rental-requests" options={{
        title: 'Mis solicitudes de alquier',
        gestureEnabled: true }} />

      {/* Módulo de fidelidad: sus pantallas traen encabezado propio */}
      <Stack.Screen
        name="loyalty-program"
        options={{ headerShown: false, gestureEnabled: true }}
      />

      <Stack.Screen
      name="my-genres"
       options={{
          title: 'Películas por género'
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
