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
            <ArrowLeft size={22} color={theme.colors.accent} strokeWidth={2.5} />
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

      {/* Pantalla de verificación de identidad (seguridad) */}
      <Stack.Screen name="security/index"
        options={{
          title: 'Verificar Identidad',
        }}
      />

      {/* Pantalla de cambio de credenciales */}
      <Stack.Screen name="security/change"
        options={{
          title: 'Cambiar Credenciales',
          gestureEnabled: true,
        }}
      />

      

      {/* Mis solicitudes de alquiler de salas */}
      <Stack.Screen name="rental-requests" options={{ 
        gestureEnabled: true }} />
      
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
});