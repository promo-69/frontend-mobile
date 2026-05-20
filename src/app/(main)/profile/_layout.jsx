// src/app/(main)/profile/_layout.jsx
import { Stack } from 'expo-router';
import { theme } from '../../../constants';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        // Estilo global para el header nativo si decides usarlo (opcional)
        headerShown: false, // Lo ponemos en false porque ya diseñaste tus propios headers con ChevronLeft
        contentStyle: {
          backgroundColor: theme.colors.background// Asegura el fondo oscuro de Cineflix en la transición
        },
        animation: 'slide_from_bottom', // Animación nativa fluida de derecha a izquierda
      }}
    >
      {/* Index es el menú principal con las tarjetas de opciones */}
      <Stack.Screen 
        name="index" 
        options={{ title: 'Mi Perfil' }} 
      />
      
      {/* Pantalla de formulario de datos personales */}
      <Stack.Screen 
        name="personal-data" 
        options={{ 
          title: 'Datos Personales',
          gestureEnabled: true, // Permite regresar arrastrando el dedo en iOS
        }} 
      />
      
      {/* Pantalla de cambio de credenciales / seguridad */}
      <Stack.Screen 
        name="change-password" 
        options={{ 
          title: 'Seguridad',
          gestureEnabled: true,
        }} 
      />
    </Stack>
  );
}