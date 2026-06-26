import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText } from '../../../../components/ui/AppText';
import { CustomButton } from '../../../../components/ui/CustomButton';
import { Input } from '../../../../components/ui/Input';
import { ScreenWrapper } from '../../../../components/ui/ScreenWrapper';
import { theme } from '../../../../constants';
import { useProfile } from '../../../../hooks/profile/useProfile';

export default function SecurityVerifyScreen() {
  const router = useRouter();
  const { verifySecurity, isUpdating } = useProfile();
  const [errorMessage, setErrorMessage] = useState(null);

  const { control, handleSubmit } = useForm({
    defaultValues: { currentPassword: '' },
  });

  const onVerify = async (values) => {
    setErrorMessage(null);
    const res = await verifySecurity(values.currentPassword);
    if (res.success && res.token) {
      router.push({
        pathname: '/profile/security/change',
        params: { token: res.token },
      });
    } else {
      setErrorMessage(res.message || 'Error al verificar la contraseña');
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
          Verificar Identidad
        </AppText>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="body" style={styles.description}>
          Para realizar cambios de seguridad es necesario verificar tu identidad
          ingresando tu contraseña actual.
        </AppText>

        <View style={styles.inputsGroup}>
          <Controller
            control={control}
            name="currentPassword"
            rules={{ required: 'La contraseña es obligatoria' }}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                label="Tu Contraseña Actual"
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
          title="Verificar"
          onPress={handleSubmit(onVerify)}
          disabled={isUpdating}
          loading={isUpdating}
        />
      </View>
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
