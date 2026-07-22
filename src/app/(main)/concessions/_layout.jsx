import { Stack } from 'expo-router';
import { theme } from '../../../constants';

export default function ConcessionsLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Confitería' }} />
    </Stack>
  );
}
