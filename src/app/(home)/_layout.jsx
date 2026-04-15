import { Stack } from 'expo-router';


export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, 
        contentStyle: { backgroundColor: '#1A1230' },
        animation: 'fade', 
      }}
    >
    <Stack.Screen name="homemain" />
         {/* Otras pantallas del Home pueden ir aquí */}
    </Stack>
  );
}