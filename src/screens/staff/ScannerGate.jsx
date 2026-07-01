import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../components/AppText';
import { CustomButton } from '../../components/ui/CustomButton';
import { theme } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { canAccessScanner } from '../../helper/roles.helper';
import ScannerScreen from './ScannerScreen';

export default function ScannerGate() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) return <Redirect href="/(staff)/login" />;

  if (!canAccessScanner(user)) {
    const handleLogout = async () => {
      await logout();
      router.replace('/(staff)/login');
    };
    return (
      <View style={styles.restricted}>
        <AppText variant="h2" style={styles.title}>
          Acceso restringido
        </AppText>
        <AppText variant="body" style={styles.text}>
          Tu rol no tiene permiso para validar códigos QR.
        </AppText>
        <CustomButton title="Cerrar sesión" onPress={handleLogout} />
      </View>
    );
  }

  return <ScannerScreen />;
}

const styles = StyleSheet.create({
  restricted: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.s24,
    gap: theme.spacing.s12,
    backgroundColor: theme.colors.background.main,
  },
  title: { color: theme.colors.primary, textAlign: 'center' },
  text: {
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.s8,
  },
});
