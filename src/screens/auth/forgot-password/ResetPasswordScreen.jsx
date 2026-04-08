import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { AppText } from '../../../components/AppText';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { theme } from '../../../constants';

export const ResetPasswordScreen = () => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleBack = () => {
    router.back();
  };

  const handleReset = () => {
    router.replace('/success-reset');
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'android' ? 'height' : 'padding'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 64}
      >
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={28} color={theme.colors.border} />
        </TouchableOpacity>

        <View style={styles.content}>
          <AppText variant="h2" style={styles.title}>
            Nueva Contraseña
          </AppText>
          <AppText variant="body" style={styles.description}>
            Crea tu nueva clave de acceso
          </AppText>

          <View style={styles.formSection}>
            <Input
              label="Nueva Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Input
              label="Confirmar Contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.actionSection}>
            <Button title="Actualizar" onPress={handleReset} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingTop: theme.spacing.s48,
    paddingBottom: theme.spacing.s48,
    paddingHorizontal: theme.spacing.s16,
  },
  backButton: {
    width: 40,
    height: 40,
    marginTop: theme.spacing.s8,
    marginLeft: theme.spacing.s16,
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.primary,
    marginTop: 16,
    ...theme.typography.variants.h2,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.s8,
  },
  formSection: {
    width: '100%',
    gap: 32,
    marginBottom: theme.spacing.s16,
  },
  actionSection: {
    width: '100%',
    marginTop: theme.spacing.s24,
    paddingBottom: theme.spacing.s48,
    gap: theme.spacing.s16,
  },
});
