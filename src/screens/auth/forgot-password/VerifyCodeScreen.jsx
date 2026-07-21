import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircle, ArrowLeft, MailCheck } from 'lucide-react-native';
import { useState } from 'react';
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
import { OTPInput } from '../../../components/ui/OTPInput';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { useAuth } from '../../../context/AuthContext';
import { theme } from '../../../constants';

export const VerifyCodeScreen = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const { verifyRecoveryCode, sendRecoveryEmail } = useAuth();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleBack = () => {
    router.back();
  };

  const handleVerifyCode = async () => {
    if (code.length < 4) {
      setNotice({
        title: 'Código incompleto',
        message: 'Ingresa los 4 dígitos del código de verificación.',
      });
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyRecoveryCode(email, code);
      if (result.success) {
        const resetToken = result.data?.data?.resetToken;
        router.push({
          pathname: '/reset-password',
          params: { email, resetToken },
        });
      } else {
        setNotice({
          title: 'Error',
          message: result.message || 'Código de verificación inválido.',
        });
      }
    } catch (error) {
      setNotice({
        title: 'Error',
        message: 'No se pudo verificar el código.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      const result = await sendRecoveryEmail(email);
      if (result.success) {
        setNotice({
          title: 'Código reenviado',
          message: 'Se envió un nuevo código a tu correo.',
        });
      } else {
        setNotice({
          title: 'Error',
          message: result.message || 'No se pudo reenviar el código.',
        });
      }
    } catch (error) {
      setNotice({
        title: 'Error',
        message: 'No se pudo reenviar el código.',
      });
    } finally {
      setIsResending(false);
    }
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
            Verifica tu identidad
          </AppText>
          <AppText variant="body" style={styles.description}>
            Ingresa el código que enviamos a tu correo
          </AppText>

          <View style={styles.formSection}>
            <OTPInput code={code} setCode={setCode} maxLength={4} />
          </View>

          <View style={styles.actionSection}>
            <CustomButton
              title={isVerifying ? 'Validando...' : 'Confirmar Código'}
              onPress={handleVerifyCode}
              disabled={isVerifying || isResending}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleResendCode}
              disabled={isResending}
            >
              <AppText style={[styles.resendText, isResending && { opacity: 0.4 }]}>
                {isResending ? 'Reenviando...' : '¿No recibiste nada? Reenviar'}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <AppAlert
        visible={!!notice}
        icon={notice?.title === 'Código reenviado' ? MailCheck : AlertCircle}
        variant={notice?.title === 'Error' ? 'danger' : 'primary'}
        title={notice?.title}
        message={notice?.message}
        confirmLabel="Entendido"
        onConfirm={() => setNotice(null)}
      />
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
  alignSelf: 'flex-start',
  padding: 8,
  marginLeft: theme.spacing.s16,
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
    marginBottom: theme.spacing.s8,
  },
  formSection: {
    width: '100%',
    marginBottom: theme.spacing.s16,
  },
  actionSection: {
    width: '100%',
    marginTop: theme.spacing.s24,
    gap: theme.spacing.s16,
  },
  resendText: {
    textAlign: 'center',
    marginTop: 30,
    opacity: 0.6,
  },
});
