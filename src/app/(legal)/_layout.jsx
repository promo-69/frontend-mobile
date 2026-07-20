import { Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '../../constants';

export default function LegalLayout() {
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
        animation: 'slide_from_right',
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
              pressed && styles.buttonPressed,
            ]}
            hitSlop={15}
          >
            <ArrowLeft
              size={22}
              color={theme.colors.accent}
              strokeWidth={2.5}
            />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen
        name="terms"
        options={{ title: 'Términos y Condiciones' }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
