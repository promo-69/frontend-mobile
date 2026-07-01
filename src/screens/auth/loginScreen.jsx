import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { CustomButton } from '../../components/ui/CustomButton';
import Logo from '../../components/ui/Icons/Logo';
import { Input } from '../../components/ui/Input';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { theme } from '../../constants';
import { AUTH_ERRORS, getErrorMessage } from '../../constants/errorMessages';
import { useAuth } from '../../context/AuthContext';
import { storageHelper } from '../../helper/storage.helper';
import {
  sanitizeInput,
  validateEmail,
  validatePassword,
} from '../../utils/validators';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [Error, setError] = useState(null);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleGoBack = () => {
    // navigation.canGoBack() devuelve true si hay una pantalla previa en el stack
    if (navigation.canGoBack()) {
      router.back();
    } else {
      // Si entraste directo al login o el stack se limpió,
      // redirigimos al home por defecto.
      router.replace('/(main)/home');
    }
  };

  const clearError = () => {
    if (Error) {
      setError(null);
    }
  };

  const onSubmit = async (data) => {
    setError(null);
    setIsLoading(true);

    // 1. Limpieza rigurosa de datos (Evita el espacio invisible del teclado)
    const cleanedData = {
      email: data.email?.trim().toLowerCase(), // Pasamos a minúsculas para estandarizar
      password: data.password, // La contraseña NO se limpia con trim si acepta espacios válidos
    };

    try {
      const result = await login(cleanedData);

      if (result?.success) {
        router.replace('/(main)/home');
      } else {
        // Validamos si la cuenta está bloqueada por falta de verificación
        if (result?.code === 'UNVERIFIED_ACCOUNT') {
          console.log(
            '⚠️ Redirigiendo a verificación para:',
            cleanedData.email
          );

          await storageHelper.saveValue(
            'user_email_to_verify',
            cleanedData.email
          );

          router.replace('/(auth)/register-verify');
          return;
        }

        // Usamos el mapeador de errores basado en el código devuelto
        setError(getErrorMessage(result?.code));
      }
    } catch (error) {
      console.error('Login error en el componente:', error);
      setError(AUTH_ERRORS.NETWORK_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const handleRecoverPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <ScreenWrapper disableSafeArea={true}>
      {/* KeyboardAvoidingView evita que el teclado cubra los inputs en iOS/Android */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ImageBackground
            source={require('../../assets/images/login-bg.jpg')}
            style={styles.headerImage}
            resizeMode="cover"
          >
            <TouchableOpacity
              onPress={handleGoBack}
              activeOpacity={0.7}
              style={styles.backButton}
            >
              <ChevronLeft size={28} color="#fff" />
            </TouchableOpacity>

            {/* Gradiente para fundir la imagen con el fondo morado */}
            <LinearGradient
              colors={[
                'transparent',
                'rgba(35, 22, 64, 0.6)',
                theme.colors.gradients.bgColor.colors[0],
              ]}
              locations={[0, 0.4, 1]}
              style={styles.gradient}
            />
          </ImageBackground>

          <View style={styles.logoSection}>
            <Logo width={187} height={43} viewBox="0 0 187 43" />
          </View>

          <View style={styles.formContainer}>
            <AppText variant="h2" style={styles.loginTitle}>
              Inicio de Sesión
            </AppText>
            <AppText variant="body" style={styles.description}>
              Accede a tu cuenta para disfrutar de todas las funcionalidades
            </AppText>

            <View style={styles.formSection}>
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
                    onChangeText={(text) => {
                      clearError();
                      onChange(sanitizeInput(text));
                    }}
                    onBlur={onBlur}
                    label="Correo"
                    keyboardType="email-address"
                    error={error?.message}
                  />
                )}
              />
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
                    value={value}
                    onChangeText={(text) => {
                      clearError();
                      onChange(text);
                    }}
                    onBlur={onBlur}
                    label="Contraseña"
                    secureTextEntry
                    error={error?.message}
                  />
                )}
              />
              <View style={styles.forgotPasswordWrapper}>
                <TouchableOpacity
                  onPress={() => handleRecoverPassword()}
                  activeOpacity={0.7}
                  style={styles.forgotPasswordContainer}
                >
                  <AppText style={styles.forgotPasswordText}>
                    ¿Olvidaste tu contraseña?
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>

            {Error && (
              <Animated.View
                entering={FadeInUp}
                exiting={FadeOutDown}
                style={styles.authErrorContainer}
              >
                <View style={styles.authErrorAccent} />
                <AppText variant="body" style={styles.authErrorText}>
                  {Error}
                </AppText>
              </Animated.View>
            )}

            <CustomButton
              title="Ingresar"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
            />
          </View>

          <View style={styles.footerSection}>
            <AppText variant="label" style={styles.footerText}>
              ¿No tienes una cuenta?{' '}
            </AppText>
            <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
              <AppText variant="label" style={styles.registerLink}>
                Regístrate aquí
              </AppText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(staff)/login')}
            activeOpacity={0.7}
            style={styles.staffLinkWrapper}
          >
            <AppText variant="label" style={styles.staffLink}>
              Acceso empleados
            </AppText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingBottom: 40,
  },
  headerImage: {
    width: width,
    height: 380,
    justifyContent: 'flex-end',
    opacity: 0.6,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: -228,
    marginBottom: theme.spacing.s16,
    zIndex: 10,
  },
  loginTitle: {
    color: theme.colors.primary,
    marginTop: theme.spacing.s16,
    marginBottom: theme.spacing.s8,
  },
  formContainer: {
    paddingHorizontal: theme.spacing.s16,
    alignItems: 'center',
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
    paddingBottom: theme.spacing.s8,
    gap: theme.spacing.s8,
  },
  authErrorContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.s12,
    paddingVertical: theme.spacing.s12,
    paddingHorizontal: theme.spacing.s14 || 14,
    borderRadius: 16,
    marginBottom: theme.spacing.s16,
    backgroundColor: 'rgba(241, 118, 118, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(246, 190, 190, 0.35)',
    shadowColor: theme.colors.red[400],
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  authErrorAccent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 999,
    backgroundColor: theme.colors.red[700],
  },
  authErrorText: {
    flex: 1,
    color: theme.colors.red[400],
    lineHeight: 20,
  },
  forgotPasswordWrapper: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: theme.spacing.s4,
  },
  forgotPasswordContainer: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  forgotPasswordText: {
    ...theme.typography.variants.label,
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.s16,
    marginBottom: theme.spacing.s24,
  },
  footerText: {
    color: theme.colors.textPrimary,
  },
  registerLink: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  staffLinkWrapper: {
    alignItems: 'center',
    marginBottom: theme.spacing.s24,
  },
  staffLink: {
    color: theme.colors.itemInactive,
    textDecorationLine: 'underline',
  },

  backButton: {
    position: 'absolute',
    top: 56,
    left: 16,
    zIndex: 20,
    padding: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
});
