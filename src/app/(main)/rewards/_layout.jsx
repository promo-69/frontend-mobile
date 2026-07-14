import { Stack } from 'expo-router';
import { theme } from '../../../constants';

export default function RewardsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Premios' }} />
    </Stack>
  );
}
