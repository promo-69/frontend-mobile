// src/app/(main)/profile/_layout.jsx
import { Stack } from 'expo-router';
import { theme } from '../../../constants';

export default function PurchasesLayout() {
  return (
    <Stack
      screenOptions={{
        // Estilo global para el header nativo si decides usarlo (opcional)
        headerShown: false, 
        contentStyle: {
          backgroundColor: theme.colors.background
        },
        animation: 'slide_from_bottom', 
      }}
    >

      <Stack.Screen 
        name="index" 
        options={{ title: 'Mis Compras' }} 
      />
      
    </Stack>
  );
}