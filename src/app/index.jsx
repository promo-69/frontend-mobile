import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { AppText } from '../components/AppText';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { ActionButton } from '../components/ui/Button';
import Logo from '../components/ui/Icons/Logo';
import { UnderlinedInput } from '../components/ui/UnderlinedInput';
import { theme } from '../constants';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Login intent:', email);
  };

  return (
    <ScreenWrapper>
      {/* KeyboardAvoidingView evita que el teclado cubra los inputs en iOS/Android */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
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
              colors={['transparent', theme.colors.background]} // Ajusta al color de tu tema
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
            <AppText variant="body1" style={styles.description}>
              Accede a tu cuenta para disfrutar de todas las funcionalidades
            </AppText>

            <View style={styles.formSection}>
              <UnderlinedInput
                label="Correo"
                value={email}
                onChangeText={setEmail}
                placeholder="usuario@ucla.edu.ve"
                keyboardType="email-address"
              />

              <View style={{ height: theme.spacing.lg }} />

              <UnderlinedInput
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                placeholder="********"
                secureTextEntry
              />
            </View>

            <View style={styles.actionSection}>
              <ActionButton title="Ingresar" onPress={handleLogin} />
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
    width: width, // Ocupa todo el ancho
    height: 380, // El alto que especificaste
    justifyContent: 'flex-end', // Empuja el logo hacia abajo de la imagen
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%', // Qué tanto se extiende el desvanecimiento
  },
  logoSection: {
    alignItems: 'center',
    marginTop: -160,
    marginBottom: theme.spacing.xxl,
    zIndex: 10,
  },
  loginTitle: {
    color: theme.colors.primary,
    marginTop: 15,
    fontSize: 28,
    fontWeight: 'bold',
  },
  formContainer: {
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  description: {
    textAlign: 'center',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  formSection: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  actionSection: {
    width: '100%',
    paddingBottom: 40,
  },
});
