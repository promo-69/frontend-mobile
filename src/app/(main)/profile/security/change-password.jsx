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
import { validatePassword } from '../../../../utils/validators';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { updateSecurity, isUpdating } = useProfile();
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const { control, handleSubmit, getValues } = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  const onSave = async (values) => {
    setErrorMessage(null);
    const res = await updateSecurity({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    if (res.success) {
      setIsSuccessVisible(true);
      setTimeout(() => {
        setIsSuccessVisible(false);
        router.back();
      }, 900);
    } else {
      setErrorMessage(res.message || 'Contraseña actual incorrecta o error al actualizar');
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="body" style={styles.description}>
          Ingresa tu contraseña actual, tu nueva contraseña y confírmala para guardar los cambios.
        </AppText>

        <View style={styles.inputsGroup}>
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

          <Controller
            control={control}
            name="newPassword"
            rules={{
              required: 'La nueva contraseña es obligatoria',
              validate: validatePassword,
            }}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                label="Nueva Contraseña"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={error?.message}
                secureTextEntry
                autoCapitalize="none"
              />
            )}
          />

          <Controller
            control={control}
            name="confirmNewPassword"
            rules={{
              required: 'Confirmar la nueva contraseña es obligatorio',
              validate: (value) =>
                value === getValues('newPassword') || 'Las contraseñas no coinciden',
            }}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                label="Confirmar Nueva Contraseña"
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
          title="Guardar Contraseña"
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
