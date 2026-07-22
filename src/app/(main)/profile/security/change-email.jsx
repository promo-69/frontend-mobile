import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '../../../../components/ui/AppText';
import { CustomButton } from '../../../../components/ui/CustomButton';
import { Input } from '../../../../components/ui/Input';
import { ScreenWrapper } from '../../../../components/ui/ScreenWrapper';
import { SuccessModal } from '../../../../components/ui/SuccessModal';
import { theme } from '../../../../constants';
import { useProfile } from '../../../../hooks/profile/useProfile';
import { validateEmail } from '../../../../utils/validators';

export default function ChangeEmailScreen() {
  const router = useRouter();
  const { updateSecurity, isUpdating } = useProfile();
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const { control, handleSubmit } = useForm({
    defaultValues: { currentPassword: '', newEmail: '' },
  });

  const onSave = async (values) => {
    setErrorMessage(null);
    const res = await updateSecurity({
      currentPassword: values.currentPassword,
      email: values.newEmail,
    });
    if (res.success) {
      setIsSuccessVisible(true);
      setTimeout(() => {
        setIsSuccessVisible(false);
        router.back();
      }, 900);
    } else {
      setErrorMessage(res.message || 'Contraseña incorrecta o error al actualizar');
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="body" style={styles.description}>
          Ingresa tu dirección de correo electrónico nueva y confirma tu contraseña actual para aplicar el cambio.
        </AppText>

        <View style={styles.inputsGroup}>
          <Controller
            control={control}
            name="newEmail"
            rules={{
              required: 'El correo electrónico es obligatorio',
              validate: validateEmail,
            }}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                label="Nuevo Correo Electrónico"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={error?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="ejemplo@correo.com"
              />
            )}
          />

          <Controller
            control={control}
            name="currentPassword"
            rules={{
              required: 'La contraseña actual es obligatoria',
            }}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                label="Contraseña Actual"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={error?.message}
                secureTextEntry
                autoCapitalize="none"
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
          title="Guardar Correo"
          onPress={handleSubmit(onSave)}
          disabled={isUpdating}
          loading={isUpdating}
        />
      </View>
      <SuccessModal
        visible={isSuccessVisible}
        onClose={() => {
          setIsSuccessVisible(false);
          router.back();
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: theme.spacing.s24,
    paddingBottom: theme.spacing.s32,
    paddingTop: theme.spacing.s16,
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
