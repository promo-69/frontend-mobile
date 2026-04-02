import { Stack } from 'expo-router'


export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, 
        contentStyle: { backgroundColor: '#1A1230' },
        animation: 'fade', 
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}