import { useRouter } from 'expo-router';
import { ChevronLeft, ScanLine } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { AppText } from '../../components/ui/AppText';
import { CustomButton } from '../../components/ui/CustomButton';
import { Input } from '../../components/ui/Input';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { theme } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { canAccessScanner } from '../../helper/roles.helper';
import { sanitizeInput, validateEmail } from '../../utils/validators';

export default function StaffLoginScreen() {
  const router = useRouter();
  const { loginEmployee } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { control, handleSubmit } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const clearError = () => error && setError(null);

  const onSubmit = async (data) => {
    setError(null);
    setIsLoading(true);
    const cleaned = {
      email: data.email?.trim().toLowerCase(),
      password: data.password,
    };
    try {
      const result = await loginEmployee(cleaned);
      if (result?.success) {
        if (canAccessScanner(result.user)) {
          router.replace('/(staff)/scanner');
        } else {
          setError(
            'Tu rol no tiene acceso al control de entradas. Contacta al administrador.'
          );
        }
      } else {
        setError(result?.message || 'Credenciales inválidas.');
      }
    } catch {
      setError('No pudimos iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <ChevronLeft size={26} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.badge}>
            <ScanLine size={30} color={theme.colors.background.main} />
          </View>

          <AppText variant="h2" style={styles.title}>
            Acceso de Personal
          </AppText>
          <AppText variant="body" style={styles.subtitle}>
            Ingresa con tu cuenta de empleado para validar entradas y
            confitería.
          </AppText>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'El correo es obligatorio',
                validate: validateEmail,
              }}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error: e },
              }) => (
                <Input
                  value={value}
                  onChangeText={(t) => {
                    clearError();
                    onChange(sanitizeInput(t));
                  }}
                  onBlur={onBlur}
                  label="Correo"
                  keyboardType="email-address"
                  error={e?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              rules={{ required: 'La contraseña es obligatoria' }}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error: e },
              }) => (
                <Input
                  value={value}
                  onChangeText={(t) => {
                    clearError();
                    onChange(t);
                  }}
                  onBlur={onBlur}
                  label="Contraseña"
                  secureTextEntry
                  error={e?.message}
                />
              )}
            />
          </View>

          {error && (
            <Animated.View
              entering={FadeInUp}
              exiting={FadeOutDown}
              style={styles.errorBox}
            >
              <View style={styles.errorAccent} />
              <AppText variant="body" style={styles.errorText}>
                {error}
              </AppText>
            </Animated.View>
          )}

          <CustomButton
            title="Ingresar"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.s16,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 20,
    padding: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  badge: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.s16,
  },
  title: {
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.s8,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.s24,
  },
  form: {
    width: '100%',
    gap: 32,
    marginBottom: theme.spacing.s16,
  },
  errorBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.s12,
    paddingVertical: theme.spacing.s12,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: theme.spacing.s16,
    backgroundColor: 'rgba(241, 118, 118, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(246, 190, 190, 0.35)',
  },
  errorAccent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 999,
    backgroundColor: theme.colors.red[700],
  },
  errorText: {
    flex: 1,
    color: theme.colors.red[400],
    lineHeight: 20,
  },
});
