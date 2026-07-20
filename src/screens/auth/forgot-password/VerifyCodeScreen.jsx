import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { AppText } from '../../../components/ui/AppText';
import { CustomButton } from '../../../components/ui/CustomButton';
import { OTPInput } from '../../../components/ui/OTPInput';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { theme } from '../../../constants';

export const VerifyCodeScreen = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState('');

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
          <ArrowLeft size={22} color={theme.colors.accent} strokeWidth={1} />
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
              title="Confirmar Código"
              onPress={() =>
                router.push({
                  pathname: '/reset-password',
                  params: { email: email },
                })
              }
            />
            <TouchableOpacity activeOpacity={0.7}>
              <AppText style={styles.resendText}>
                ¿No recibiste nada? Reenviar
              </AppText>
            </TouchableOpacity>
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
  backgroundColor: 'rgba(0,0,0,0.5)',
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
