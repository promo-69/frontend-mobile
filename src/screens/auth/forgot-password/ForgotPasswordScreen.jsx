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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push({
      pathname: '/verify-code',
      params: { email },
    });
  };

  const handleCancel = () => {
    router.push({
      pathname: '/login',
    });
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
            Recuperar Contraseña
          </AppText>
          <AppText variant="body" style={styles.description}>
            Ingresa tu correo electrónico para enviarte un código de de
            recuperación
          </AppText>

          <View style={styles.formSection}>
            <Input
              value={email}
              label="Correo"
              keyboardType="email-address"
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.actionSection}>
            <Button title="Enviar" onPress={handleNext} />
            <Button
              title="Cancelar"
              onPress={handleCancel}
              style={{
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: theme.colors.primary,
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

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
    marginTop: theme.spacing.s8,
    marginBottom: theme.spacing.s16,
  },
  formSection: {
    width: '100%',
    gap: 32,
    marginBottom: theme.spacing.s16,
  },
  actionSection: {
    width: '100%',
    marginTop: theme.spacing.s24,
    gap: theme.spacing.s24,
  },
});
