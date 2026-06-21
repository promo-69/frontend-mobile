import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText } from '../../../../components/AppText';
import { ScreenWrapper } from '../../../../components/ScreenWrapper';
import { SuccessModal } from '../../../../components/SuccessModal';
import { CustomButton } from '../../../../components/ui/CustomButton';
import { Input } from '../../../../components/ui/Input';
import { theme } from '../../../../constants';
import { useProfile } from '../../../../hooks/profile/useProfile';

export default function SecurityChangeScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const { changeSecurity, isUpdating } = useProfile();
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  const { control, handleSubmit } = useForm({
    defaultValues: { newEmail: '', newPassword: '' },
  });
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!token) {
      // If there's no token, go back to verification
      router.replace('/profile/security');
    }
  }, [token]);

  const onSave = async (values) => {
    const payload = { securityChangeToken: token };
    if (values.newPassword && values.newPassword.trim() !== '')
      payload.newPassword = values.newPassword;
    if (values.newEmail && values.newEmail.trim() !== '')
      payload.newEmail = values.newEmail;

    setErrorMessage(null);
    const res = await changeSecurity(payload);
    if (res.success) {
      setIsSuccessVisible(true);
      setTimeout(() => {
        setIsSuccessVisible(false);
        router.push('/profile');
      }, 900);
    } else {
      setErrorMessage(res.message || 'Error al aplicar cambios de seguridad');
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={28} color={theme.colors.border} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>
          Cambiar Credenciales
        </AppText>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="body" style={styles.description}>
          Ingresa tu nueva dirección de correo o una nueva contraseña. Dejar en
          blanco mantiene el valor actual.
        </AppText>

        <View style={styles.inputsGroup}>
          <Controller
            control={control}
            name="newEmail"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                label="Nuevo Correo (Opcional)"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={error?.message}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />

          <Controller
            control={control}
            name="newPassword"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                label="Nueva Contraseña (Opcional)"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={error?.message}
                secureTextEntry
                autoCapitalize="none"
                placeholder="Dejar en blanco para mantener actual"
              />
            )}
          />
          {errorMessage ? (
            <AppText variant="small" style={{ color: 'tomato', marginTop: 8 }}>
              {errorMessage}
            </AppText>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Guardar Cambios"
          onPress={handleSubmit(onSave)}
          disabled={isUpdating}
          loading={isUpdating}
        />
      </View>
      <SuccessModal
        visible={isSuccessVisible}
        onClose={() => {
          setIsSuccessVisible(false);
          router.push('/profile');
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s16,
    paddingTop: theme.spacing.s8,
    marginBottom: theme.spacing.s16,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: {
    color: theme.colors.primary,
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 40,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.s24,
    paddingBottom: theme.spacing.s32,
  },
  description: {
    color: theme.colors.textSecondary,
    opacity: 0.6,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: theme.spacing.s24,
  },
  inputsGroup: { gap: theme.spacing.s24 },
  footer: { padding: theme.spacing.s24, backgroundColor: 'transparent' },
});
