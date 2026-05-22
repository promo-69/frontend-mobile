import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { AppText } from '../../../components/AppText';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { CustomButton } from '../../../components/ui/CustomButton';
import { SuccessModal} from '../../../components/SuccessModal'
import { Input } from '../../../components/ui/Input';
import { theme } from '../../../constants';
import { useProfile } from '../../../hooks/profile/useProfile';
import { validateEmail, validatePassword } from '../../../utils/validators'

export default function SecurityDataScreen() {
  const router = useRouter();
  const { profile, loading, isUpdating, updateSecurity } = useProfile();
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  const { control, handleSubmit, getValues, reset, formState: { isDirty } } = useForm({
    defaultValues: {
      currentPassword: '',
      newEmail: '',
      newPassword: '',
    }
  });

  useEffect(() => {
    if (profile) {
      reset({
        currentPassword: '',
        newEmail: profile.email || '',
        newPassword: '',
      });
    }
  }, [profile, reset]);

  const onSave = async () => {
    const formValues = getValues();
    
    // Mapeo estructurado para tu endpoint /me/security
    const securityRequest = {
      currentPassword: formValues.currentPassword,
      email: formValues.newEmail,
      newPassword: formValues.newPassword.trim() !== "" ? formValues.newPassword : undefined,
    };

    const result = await updateSecurity(securityRequest);

    if (result.success) {
      setIsSuccessVisible(true);
    } else {
      alert(result.message);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={theme.colors.border} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>Seguridad</AppText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AppText variant="body" style={styles.description}>
          Para cambiar tus credenciales de inicio de sesión o clave de acceso, completa los campos. Es obligatorio confirmar tu identidad con tu contraseña actual.
        </AppText>

        <View style={styles.inputsGroup}>
          <Controller
            control={control}
            name="newEmail"
            rules={{ required: 'El correo de cuenta es obligatorio' }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input label="Correo de Inicio de Sesión" value={value} onBlur={onBlur} onChangeText={onChange} error={error?.message} keyboardType="email-address" autoCapitalize="none" />
            )}
          />

          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input label="Nueva Contraseña (Opcional)" value={value} onBlur={onBlur} onChangeText={onChange} error={error?.message} secureTextEntry autoCapitalize="none" placeholder="Dejar en blanco para mantener actual" />
            )}
          />

          <View style={styles.dividerZone} />

          <Controller
            control={control}
            name="currentPassword"
            rules={{ required: 'Es obligatorio ingresar tu contraseña para confirmar los cambios' }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input label="Tu Contraseña Actual" value={value} onBlur={onBlur} onChangeText={onChange} error={error?.message} secureTextEntry autoCapitalize="none" />
            )}
          />
        </View>
      </ScrollView>

      {/* Footer Fijo */}
      <View style={styles.footer}>
        <CustomButton
          title="Guardar"
          onPress={handleSubmit(onSave)}
          disabled={!isDirty || isUpdating}
        />
      </View>

      <SuccessModal visible={isSuccessVisible} onClose={() => { setIsSuccessVisible(false); router.back(); }} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: theme.spacing.s16, 
    paddingTop: theme.spacing.s8, 
    marginBottom: theme.spacing.s16 
  },
  backButton: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center' 
  },
  headerTitle: { color: theme.colors.primary, flex: 1, fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginRight: 40 },
  scrollContent: { paddingHorizontal: theme.spacing.s24, paddingBottom: theme.spacing.s32 },
  description: { color: theme.colors.textSecondary, opacity: 0.6, fontSize: 14, lineHeight: 20, marginBottom: theme.spacing.s32 },
  inputsGroup: { gap: theme.spacing.s24 },
  dividerZone: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: theme.spacing.s8 },
  footer: { padding: theme.spacing.s24, backgroundColor: 'transparent' }
});