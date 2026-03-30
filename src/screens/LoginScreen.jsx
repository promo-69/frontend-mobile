import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
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
import { AppText } from '../components/AppText';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Button } from '../components/ui/Button';
import Logo from '../components/ui/Icons/Logo';
import { Input } from '../components/ui/Input';
import { theme } from '../constants';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    console.log('Login intent:', email);
  };

  const handleRegister = () => {
    console.log('Navegar a Registro');
  };

  return (
    <ScreenWrapper disableSafeArea={true}>
      {/* KeyboardAvoidingView evita que el teclado cubra los inputs en iOS/Android */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'android' ? 'height' : 'padding'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 64}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <ImageBackground
            source={require('../assets/images/login-bg.jpg')}
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
            <AppText variant="h1" style={styles.loginTitle}>
              Inicio de Sesión
            </AppText>
            <AppText variant="body" style={styles.description}>
              Accede a tu cuenta para disfrutar de todas las funcionalidades
            </AppText>

            <View style={styles.formSection}>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Correo"
                keyboardType="email-address"
              />
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="Contraseña"
                secureTextEntry={!showPassword}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    {showPassword ? (
                      <Eye size={20} color={theme.colors.textSecondary} />
                    ) : (
                      <EyeOff size={20} color={theme.colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                }
              />
              <View style={styles.forgotPasswordWrapper}>
                <TouchableOpacity
                  onPress={() => console.log('Recuperar contraseña')}
                  activeOpacity={0.7}
                  styles={styles.forgotPasswordContainer}
                >
                  <AppText style={styles.forgotPasswordText}>
                    ¿Olvidaste tu contraseña?
                  </AppText>
                </TouchableOpacity>
              </View>

              {/*<Pressable
              onPress={()=>console.log('Recuperar contraseña')}
               >
              <Text>
                ¿Olvidaste tu contraseña?
              </Text>
              </Pressable>*/}
            </View>

            <View style={styles.actionSection}>
              <Button title="Ingresar" onPress={handleLogin} />
            </View>

            <View style={styles.footerSection}>
              <AppText variant="body" style={styles.footerText}>
                ¿No tienes una cuenta?{' '}
              </AppText>
              <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
                <AppText variant="body" style={styles.registerLink}>
                  Regístrate
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
    marginTop: -160,
    marginBottom: theme.spacing.s16,
    zIndex: 10,
  },
  loginTitle: {
    color: theme.colors.primary,
    marginTop: 15,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
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
    gap: 8,
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
    marginTop: theme.spacing.s8,
  },
  forgotPasswordContainer: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  forgotPasswordText: {
    ...theme.typography.variants.label,
    color: theme.colors.primary,
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: 'rgba(217, 152, 47, 0.3)',
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
  },
});
