import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { storageHelper } from '../../helper/storage.helper';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { CustomButton } from '../../components/ui/CustomButton';
import { OTPInput } from '../../components/OTPInput';
import { useAuth } from '../../context/AuthContext';
import { SuccessScreen } from '../shared/SuccessScreen'; 
import { theme } from '../../constants';

export default function EmailCheck() {
  const router = useRouter();
  const { verifyAccount, sendRecoveryEmail } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Estado para el código como string (necesario para OTPInput)
  const [code, setCode] = useState('');

  // Cargar el correo del usuario persistido tras el registro
  useEffect(() => {
    const getSavedEmail = async () => {
      const savedEmail = await storageHelper.getValue('user_email_to_verify');
      if (savedEmail) {
        setEmail(savedEmail);
      } else {
        Alert.alert("Aviso", "No se encontró un correo pendiente de verificación.");
        router.replace('/register');
      }
    };
    getSavedEmail();
  }, []);

  // Efecto para redirigir al Login después de ver la pantalla de Éxito
  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  // Auto-disparo de la verificación cuando el código llega a 4 dígitos
  useEffect(() => {
    if (code.length === 4) {
      handleContinue(code);
    }
  }, [code]);

  const handleContinue = async (fullCode) => {
    const finalCode = typeof fullCode === 'string' ? fullCode : code;
    
    if (finalCode.length < 4) {
      Alert.alert("Código incompleto", "Por favor ingresa los 4 dígitos.");
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyAccount(email, finalCode);

      if (result.success) {
        // Limpiamos el correo temporal ya verificado de la persistencia
        await storageHelper.removeValue('user_email_to_verify');
        // Activamos la pantalla de felicitaciones
        setShowSuccess(true);
      } else {
        Alert.alert("Verificación fallida", result.message || "Código incorrecto.");
        setCode(''); // Limpiar el código en caso de error
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un problema al conectar con el servidor.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      Alert.alert("Error", "No hay un correo para reenviar el código.");
      return;
    }
    setIsResending(true);
    try {
      const result = await sendRecoveryEmail(email);
      if (result.success) {
        Alert.alert("Éxito", "Se ha reenviado el código a tu correo.");
      } else {
        Alert.alert("Error", result.message || "No se pudo reenviar el código.");
      }
    } catch (error) {
      console.error("Error reenviando código:", error);
      Alert.alert("Error", "Ocurrió un problema al reenviar el código.");
    } finally {
      setIsResending(false);
    }
  };

  // Si completó el flujo con éxito, renderizamos tu SuccessScreen tal como deseas
  if (showSuccess) {
    return (
      <SuccessScreen
        title="¡Cuenta Verificada!"
        message="Tu correo electrónico ha sido validado correctamente. Ya puedes iniciar sesión con tus credenciales."
        onPress={() => router.replace('/login')}
      />
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.content}>
        <Text style={styles.title}>¡Revisa tu bandeja de entrada!</Text>
        <Text style={styles.subtitle}>
          Te enviamos un código de 4 dígitos a <Text style={{fontWeight: 'bold'}}>{email || 'tu correo'}</Text> para validar y culminar tu registro.
        </Text>

        {/* Uso del componente OTPInput */}
        <OTPInput code={code} setCode={setCode} maxLength={4} />

        <View style={styles.buttonWrapper}>
          <CustomButton
            title="Verificar Código"
            onPress={handleContinue}
            loading={isVerifying}
            disabled={isVerifying || code.length < 4}
          />
          <TouchableOpacity
            onPress={handleResendCode}
            disabled={isResending || isVerifying}
            style={styles.resendButton}
            testID="resend-code-button"
          >
            {isResending ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={styles.resendButtonText}>Reenviar código</Text>
            )}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  logo: {
    width: 240,
    height: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme?.colors?.primary || '#231640',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 20,
  },
  buttonWrapper: {
    width: '100%',
  },
  resendButton: {
    marginTop: 15,
    paddingVertical: 10,
    alignItems: 'center',
  },
  resendButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});