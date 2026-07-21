import { useRouter } from 'expo-router';
import { AlertCircle, ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { AppAlert } from '../../../components/ui/AppAlert';
import { AppText } from '../../../components/ui/AppText';
import { CustomButton } from '../../../components/ui/CustomButton';
import { Input } from '../../../components/ui/Input';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { useAuth } from '../../../context/AuthContext';
import { theme } from '../../../constants';
import { sanitizeInput, validateEmail } from '../../../utils/validators';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { sendRecoveryEmail } = useAuth();
  const [notice, setNotice] = useState(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    const cleanEmail = sanitizeInput(data.email, 'email');
    try {
      const result = await sendRecoveryEmail(cleanEmail);
      if (result.success) {
        router.push({
          pathname: '/(auth)/verify-code',
          params: { email: cleanEmail },
        });
      } else {
        setNotice({
          title: 'Error',
          message: result.message || 'No se pudo enviar el correo de recuperación.',
        });
      }
    } catch (error) {
      setNotice({
        title: 'Error',
        message: 'No se pudo enviar el correo de recuperación.',
      });
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
          <ArrowLeft size={22} color="white" strokeWidth={1} />
        </TouchableOpacity>
        <View style={styles.content}>
          <AppText variant="h2" style={styles.title}>
            Recuperar Contraseña
          </AppText>
          <AppText variant="body" style={styles.description}>
            Ingresa tu correo electrónico para enviarte un código de
            recuperación
          </AppText>

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'El correo es obligatorio',
              validate: validateEmail,
            }}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                label="Correo"
                keyboardType="email-address"
                error={error?.message}
              />
            )}
          />
          <View style={styles.actionSection}>
            <CustomButton
              title={isSubmitting ? 'Enviando...' : 'Enviar'}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            />
            <CustomButton
              title="Cancelar"
              onPress={handleBack}
              style={{
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: theme.colors.primary,
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      <AppAlert
        visible={!!notice}
        icon={AlertCircle}
        title={notice?.title}
        message={notice?.message}
        confirmLabel="Entendido"
        onConfirm={() => setNotice(null)}
      />
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
  alignSelf: 'flex-start',
  padding: 8,
  backgroundColor: 'rgba(0,0,0,0.5)',
  borderRadius: 999,
  marginBottom: 16,
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
