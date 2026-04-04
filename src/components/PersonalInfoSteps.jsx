import { Controller } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { theme } from '../constants';
import {
    validateDate,
    validateEmail,
    validateGenres,
    validateNames,
    validatePassword,
    validatePhoneNumberVE,
} from '../utils/validators';
import { AppText } from './AppText';
import { GenreSelectionStep } from './GenreSelectionStep';
import { Checkbox } from './ui/CheckBox';
import { DateInput } from './ui/DateInput';
import { Input } from './ui/Input';
import { SelectorInput } from './ui/SelectorInput';


export const PersonalInfoSteps = ({
  step,
  control,
  errors,
  setValue,
  watch,
}) => {
  // Paso 1 Información Personal
  if (step === 1) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <AppText variant="body" style={styles.subtitle}>
            Ingresa tus datos básicos para comenzar tu experiencia en Cineflix.
          </AppText>
        </View>

        <View style={styles.formContainer}>
          <Controller
            control={control}
            name="firstName"
            rules={{
              required: 'Los nombres son obligatorios',
              validate: validateNames,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nombres"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.firstName?.message}
                autoCapitalize="words"
              />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            rules={{
              required: 'Los apellidos son obligatorios',
              validate: validateNames,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Apellidos"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.lastName?.message}
                autoCapitalize="words"
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'El correo es obligatorio',
              validate: validateEmail,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Correo Electrónico"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            rules={{ validate: validatePhoneNumberVE }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Teléfono"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.phoneNumber?.message}
                keyboardType="phone-pad"
              />
            )}
          />
        </View>
      </ScrollView>
    );
  }

  // Paso 2 Detalles de Cuenta y Seguridad
  if (step === 2) {
    const password = watch('password');

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Controller
            control={control}
            name="documentNumber"
            rules={{ required: 'La cédula es requerida' }}
            render={({ field: { onChange, value } }) => (
              <SelectorInput
                label="Cédula de Identidad"
                value={value}
                onChangeText={onChange}
                onSelect={(type) => setValue('documentType', type)}
                error={errors.documentNumber?.message}
                keyboardType="numeric"
              />
            )}
          />

          <Controller
            control={control}
            name="dateBirth"
            rules={{
              required: 'La fecha es requerida',
              validate: validateDate,
            }}
            render={({ field: { onChange, value } }) => (
              <DateInput
                label="Fecha de Nacimiento (DD/MM/AAAA)"
                value={value}
                error={errors.dateBirth?.message}
                onChange={onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'La contraseña es obligatoria',
              validate: validatePassword,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Contraseña"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.password?.message}
                secureTextEntry
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: 'Confirme su contraseña',
              validate: (val) =>
                val === password || 'Las contraseñas no coinciden',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirmar contraseña"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
                secureTextEntry
              />
            )}
          />

          <Controller
            control={control}
            name="acceptTerms"
            rules={{
              validate: (v) => v === true || 'Debes aceptar los términos',
            }}
            render={({ field: { onChange, value } }) => (
              <Checkbox
                value={value}
                onChange={onChange}
                error={errors.acceptTerms?.message}
              >
                <AppText
                  variant="label"
                  style={{ color: theme.colors.textPrimary }}
                >
                  Acepto los{' '}
                  <AppText
                    variant="label"
                    style={{
                      color: theme.colors.primary,
                      textDecorationLine: 'underline',
                    }}
                    onPress={() => {
                      console.log('Navegar a términos y condiciones');
                    }}
                  >
                    Términos y Condiciones
                  </AppText>
                </AppText>
              </Checkbox>
            )}
          />
        </View>
      </ScrollView>
    );
  }

  // Paso 3 Selecciona Géneros
  if (step === 3) {
    return (
      <Controller
        control={control}
        name="favoriteGenres"
        rules={{ validate: validateGenres }}
        render={({ field: { value, onChange } }) => (
          <GenreSelectionStep
            value={value}
            onChange={onChange}
            error={errors.favoriteGenres?.message}
          />
        )}
      />
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: theme.spacing.s32,
  },
  header: {
    marginBottom: theme.spacing.s24,
    alignItems: 'center',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.s16,
    ...theme.typography.variants.body,
  },
  formContainer: {
    gap: theme.spacing.s24,
  },
});
