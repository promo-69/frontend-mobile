import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { AppText } from '../../../components/ui/AppText';
import { CustomButton } from '../../../components/ui/CustomButton';
import { Input } from '../../../components/ui/Input';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { theme } from '../../../constants';
import {
    validatePassword,
    validatePasswordMatch,
} from '../../../utils/validators';

export const ResetPasswordScreen = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const { control, handleSubmit, watch } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('password');

  const onSubmit = async (data) => {
    try {
      // API
      // await api.post('/auth/reset-password', {
      // password: data.password,
      // email: params.email
      //  });
      //
      console.log('Cambiando clave para:', email);
      console.log('Nueva clave:', data.password);
      router.replace('/(auth)/success-reset');
    } catch (error) {
      // Manejar error de servidor
      console.error('Error en el servidor:', error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'android' ? 'height' : 'padding'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 64}
      >
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={22} color={theme.colors.accent} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.content}>
          <AppText variant="h2" style={styles.title}>
            Nueva Contraseña
          </AppText>
          <AppText variant="body" style={styles.description}>
            Crea tu nueva clave de acceso
          </AppText>

          <View style={styles.formSection}>
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'La contraseña es obligatoria',
                validate: validatePassword,
              }}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <Input
                  label="Nueva Contraseña"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  error={error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: 'Debes confirmar la contraseña',
                validate: (value) => validatePasswordMatch(newPassword, value),
              }}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <Input
                  label="Confirmar Contraseña"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  error={error?.message}
                />
              )}
            />
          </View>

          <View style={styles.actionSection}>
            <CustomButton title="Actualizar" onPress={handleSubmit(onSubmit)} />
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
  padding: 8,
  marginTop: theme.spacing.s8,
  marginLeft: theme.spacing.s16,
  borderRadius: 999,
  backgroundColor: 'rgba(0,0,0,0.25)',
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
