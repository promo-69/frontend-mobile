import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        
        headerShown: false,
    
        animation: 'slide_from_right',
        
        contentStyle: {
          backgroundColor: '#0F0A1C', 
        },
      }}
    >
      {/*  La pantalla raíz o principal de la pestaña */}
      <Stack.Screen 
        name="index" 
      />
      <Stack.Screen
        name="releases"
      />
      <Stack.Screen
        name="upcoming"
      />
      <Stack.Screen
        name="events"
      />      
      {/* NOTA: Si más adelante se agrega la sub-pantalla de la IA ('ai-assistant.jsx'), no es obligatorio registrarla aquí. Con solo crear el archivo en la carpeta, Expo Router la mapeará automáticamente heredando estas mismas configuraciones. */}
    </Stack>
  );
}