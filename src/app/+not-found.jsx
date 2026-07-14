import { Stack, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../components/ui/AppText';
import { CustomButton } from '../components/ui/CustomButton';
import { theme } from '../constants';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'No Encontrada', headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.content}>
          <AppText style={styles.title}>404</AppText>
          <AppText variant="h2" style={styles.subtitle}>
            Ruta No Encontrada
          </AppText>
          <AppText variant="body" style={styles.description}>
            ¡Vaya! La sección que estás intentando buscar no existe, ha cambiado
            de lugar o no tienes permisos para verla.
          </AppText>
          <CustomButton
            title="VOLVER AL INICIO"
            onPress={() => router.replace('/(main)/home')}
            style={styles.button}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.main || '#1b1130',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.s24,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  title: {
    fontSize: 90,
    fontFamily: theme.typography.family.primary.bold || 'System',
    color: theme.colors.primary,
    marginBottom: theme.spacing.s8,
    textAlign: 'center',
    lineHeight: 90,
  },
  subtitle: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.s16,
    textAlign: 'center',
  },
  description: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.s32,
    lineHeight: 22,
  },
  button: {
    width: '100%',
  },
});
