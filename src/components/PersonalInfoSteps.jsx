import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants';
import {
  validateDate,
  validateDocument,
  validateEmail,
  validateGenres,
  validateNames,
  validatePassword,
  validatePhoneNumberVE
} from '../utils/validators';
import { AppText } from './AppText';
import { GenreSelectionStep } from './GenreSelectionStep';
import { Checkbox } from './ui/CheckBox';
import { DateInput } from './ui/DateInput';
import { Input } from './ui/Input';
import { SelectorInput } from './ui/SelectorInput';


const GENDER_OPTIONS = [
  { label: 'Masculino', value: 1 },
  { label: 'Femenino', value: 2 },
];

export const PersonalInfoSteps = ({
  step,
  control,
  errors,
  getValues,
}) => {
  const [isGenderOpen, setIsGenderOpen] = useState(false);

  // Paso 1 Información Personal
  if (step === 1) {
    return (
      <View style={styles.container}>
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
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
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
              required: 'Los apellidos son obligatorios',
              validate: validateNames,
            }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
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
            name="email"
            rules={{
              required: 'El correo es obligatorio',
              validate: validateEmail,
            }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input
                label="Correo Electrónico"
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
            name="phoneNumber"
            rules={{ validate: validatePhoneNumberVE }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input
                label="Teléfono"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={error?.message}
                keyboardType="phone-pad"
              />
            )}
          />
        </View>
      </View>
    );
  }

  // Paso 2 Detalles de Cuenta y Seguridad
  if (step === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Controller
            control={control}
            name="documentNumber"
            rules={{
              required: "La cédula es requerida",
              validate: validateDocument,
            }}
            render={({ field: { onChange, onBlur, value = "V" }, fieldState: { error } }) => {
              // Extraemos el tipo (primer carácter) y el número (el resto)
              const type = value?.charAt(0) || "V";
              const number = value?.slice(1) || "";

              return (
                <SelectorInput
                  label="Cédula de Identidad"
                  selectedValue={type}
                  value={number}
                  onBlur={onBlur}
                  onSelect={(newType) => onChange(newType + number)}
                  onChangeText={(newNumber) => {
                    const clean = newNumber.replace(/\D/g, "");
                    onChange(type + clean);
                  }}
                  error={error?.message}
                  keyboardType="numeric"
                />
              );
            }}
          />

          <Controller
            control={control}
            name="birthDate"
            rules={{
              required: 'La fecha es requerida',
              validate: validateDate,
            }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <DateInput
                label="Fecha de Nacimiento (DD/MM/AAAA)"
                value={value}
                error={error?.message}
                onChange={onChange}
                onBlur={onBlur}
              />
            )}
          />

          <Controller
            control={control}
            name="gender"
            rules={{ required: 'El género es obligatorio' }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
              const selectedGender = GENDER_OPTIONS.find(
                (option) => option.value === value
              );

              return (
                <View style={styles.genderWrapper}>
                  <AppText variant="label" style={styles.inputLabel}>Género</AppText>
                  <TouchableOpacity
                    testID="gender-dropdown-trigger"
                    activeOpacity={0.7}
                    onPress={() => setIsGenderOpen(!isGenderOpen)}
                    onBlur={onBlur}
                    style={[
                      styles.genderDropdownTrigger,
                      error && styles.genderContainerError,
                      isGenderOpen && styles.genderContainerFocused
                    ]}
                  >
                    <AppText style={[
                      styles.genderValueText,
                      !selectedGender && { color: theme.colors.textSecondary }
                    ]}>
                      {selectedGender?.label || 'Seleccionar género'}
                    </AppText>
                    <ChevronDown 
                      size={20} 
                      color={theme.colors.primary} 
                      style={{ transform: [{ rotate: isGenderOpen ? '180deg' : '0deg' }] }}
                    />
                  </TouchableOpacity>

                  {isGenderOpen && (
                    <View style={styles.dropdownMenu}>
                      {GENDER_OPTIONS.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          testID={`gender-option-${option.label}`}
                          style={styles.dropdownOption}
                          onPress={() => {
                            onChange(option.value);
                            setIsGenderOpen(false);
                          }}
                        >
                          <AppText style={styles.optionText}>{option.label}</AppText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {error && (
                    <AppText style={styles.errorTextSmall}>{error.message}</AppText>
                  )}
                </View>
              );
            }}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'La contraseña es requerida',
              validate: validatePassword,
            }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input
                label="Contraseña"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={error?.message}
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
                val === getValues('password') || 'Las contraseñas no coinciden',
            }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input
                label="Confirmar contraseña"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={error?.message}
                secureTextEntry
              />
            )}
          />

          <Controller
            control={control}
            name="acceptTerms"
            rules={{
              validate: (v) => v === true || 'Debes aceptar los términos y condiciones',
            }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Checkbox
                value={value}
                onChange={onChange}
                error={error?.message}
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
      </View>
    );
  }

  // Paso 3 Selecciona Géneros
  if (step === 3) {
    return (
       <EmailCheck />
    );
  }
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
  genderWrapper: {
    marginTop: theme.spacing.s8,
    zIndex: 1000, // Asegura que el dropdown flote sobre otros elementos
  },
  inputLabel: {
    color: theme.colors.primary,
    fontSize: theme.typography.size.s12,
    fontFamily: theme.typography.family.primary.semiBold,
    marginBottom: theme.spacing.s8,
  },
  genderDropdownTrigger: {
    flexDirection: 'row',
    height: 48,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.s4,
  },
  genderValueText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.size.s16,
  },
  genderContainerFocused: {
    borderBottomColor: theme.colors.primary,
  },
  genderContainerError: {
    borderBottomColor: theme.colors.error,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 75,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 2000,
  },
  dropdownOption: {
    padding: theme.spacing.s16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  optionText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.size.s16,
  },
  errorTextSmall: {
    color: theme.colors.error,
    fontSize: theme.typography.size.s12,
    marginTop: theme.spacing.s4,
  }
});
