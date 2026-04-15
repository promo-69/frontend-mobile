
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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
import { AppText } from '../../components/AppText';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import Logo from '../../components/ui/Icons/Logo';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../constants';
import {
  sanitizeInput,
  validateEmail,
  validatePassword,
} from '../../utils/validators';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const router = useRouter();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data);
    } catch (error) {
      console.error('Login error:', error);
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
                    onChangeText={onChange}
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
                  required: 'LLenar campos faltantes',
                  validate: validatePassword,
                }}
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
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

            <View style={styles.actionSection}>
              <Button 
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
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
    paddingBottom: theme.spacing.s48,
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
    marginTop: -theme.spacing.s32,
    marginBottom: theme.spacing.s32,
  },
  footerText: {
    color: theme.colors.textPrimary,
  },
  registerLink: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});
