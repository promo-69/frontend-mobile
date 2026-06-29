import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { AppText } from '../../../components/ui/AppText';
import { CustomButton } from '../../../components/ui/CustomButton';
import { Input } from '../../../components/ui/Input';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { SuccessModal } from '../../../components/ui/SuccessModal';
import { theme } from '../../../constants';
import { useProfile } from '../../../hooks/profile/useProfile';
import {
    validateNames,
    validatePhoneNumberVE,
} from '../../../utils/validators';

export default function PersonalDataScreen() {
  const router = useRouter();
  const { profile, loading, isUpdating, updateProfileData } = useProfile();
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    reset,
    formState: { isDirty, dirtyFields },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      personalEmail: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
        personalEmail: profile.personalEmail || '',
      });
    }
  }, [profile, reset]);

  const onSave = async () => {
    const formValues = getValues();
    const patchPayload = {};

    // Construcción dinámica del PATCH (Sólo lo modificado)
    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        patchPayload[key] = formValues[key];
      }
    });

    const result = await updateProfileData(patchPayload);

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
      {/* Header 
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={28} color={theme.colors.border} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>
          Datos Personales
        </AppText>
      </View>*/}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="body" style={styles.description}>
          Mantén actualizada tu información de contacto. Estos datos no son
          públicos y se usan solo para la gestión de tus entradas.
        </AppText>

        <View style={styles.inputsGroup}>
          <Controller
            control={control}
            name="firstName"
            rules={{
              required: 'El nombre es obligatorio',
              validate: validateNames,
            }}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                label="Nombres"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={error?.message}
                autoCapitalize="words"
              />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            rules={{
              required: 'El apellido es obligatorio',
              validate: validateNames,
            }}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                label="Apellidos"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={error?.message}
                autoCapitalize="words"
              />
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            rules={{ validate: validatePhoneNumberVE }}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                label="Teléfono Móvil"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={error?.message}
                keyboardType="phone-pad"
              />
            )}
          />

          <Controller
            control={control}
            name="personalEmail"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                label="Correo Alternativo"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={error?.message}
                keyboardType="email-address"
                autoCapitalize="none"
              />
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
    marginBottom: theme.spacing.s32,
  },
  inputsGroup: { gap: theme.spacing.s24 },
  dividerZone: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: theme.spacing.s8,
  },
  footer: { padding: theme.spacing.s24, backgroundColor: 'transparent' },
});
