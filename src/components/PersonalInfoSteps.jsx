import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View, Modal, TouchableWithoutFeedback } from 'react-native';
import { theme } from '../constants';
import {
  validateDate,
  validateDocumentNoType,
  validateEmail,
  validateNames,
  validatePassword,
} from '../utils/validators';
import { AppText } from './AppText';
import { Checkbox } from './ui/CheckBox';
import { DateInput } from './ui/DateInput';
import { Input } from './ui/Input';
import { SelectorInput } from './ui/SelectorInput';

const GENDER_OPTIONS = [
  { label: 'Masculino', value: 1 },
  { label: 'Femenino', value: 2 },
];

const COUNTRY_OPTIONS = [
  { flag: '🇻🇪', code: '+58', label: 'Venezuela' },
  { flag: '🇨🇴', code: '+57', label: 'Colombia' },
];

export const PersonalInfoSteps = ({
  step,
  control,
  errors,
  getValues,
  setValue, 
}) => {
  const [isGenderOpen, setIsGenderOpen] = useState(false);

  // Paso 1: Información Personal
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

          {/* Teléfono Internacional con Selector de Código de País */}
          <Controller
          control={control}
          name="phoneNumber"
          rules={{
            required: 'El teléfono es obligatorio',
            validate: (value) => {
              const digitsOnly = value ? value.replace(/\D/g, '') : '';
              // Restamos los 2 dígitos correspondientes al prefijo internacional (+58 o +57)
              const netLength = digitsOnly.length - 2; 

              if (netLength < 7 || netLength > 15) {
                return 'Teléfono debe tener entre 7 y 15 dígitos';
              }
              return true;
            }
          }}
          render={({ field: { onChange, onBlur, value = "+58" }, fieldState: { error } }) => {
            // 1. Determinar cuál es el prefijo actual que está al inicio del string
            const currentCode = value?.startsWith('+57') ? '+57' : '+58';
            
            // 2. Extraer el resto de la cadena telefónica pura para el input de texto
            const currentNumber = value?.replace(currentCode, '') || '';

            return (
              <SelectorInput
                label="Teléfono"
                // Evaluamos visualmente qué bandera mostrar según el prefijo activo en el form
                selectedValue={currentCode === '+58' ? '🇻🇪' : '🇨🇴'}
                value={currentNumber}
                onBlur={onBlur}
                keyboardType="phone-pad"
                error={error?.message}
                // Al tocar el dropdown del componente, alternamos o elegimos el país
                onSelect={(newFlag) => {
                  const newCode = newFlag === '🇻🇪' ? '+58' : '+57';
                  onChange(newCode + currentNumber);
                }}
                // Al escribir sobre el teclado numérico, sanitizamos y concatenamos
                onChangeText={(newNumber) => {
                  const clean = newNumber.replace(/\D/g, "");
                  onChange(currentCode + clean);
                }}
              
                options={['🇻🇪','🇨🇴']}
              />
            );
          }}
        />
        </View>
      </View>
    );
  }

  // Paso 2: Detalles de Cuenta
  if (step === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Controller
        control={control}
        name="documentNumber"
        rules={{
          required: "La cédula es requerida",
          validate: validateDocumentNoType,
        }}
        render={({ field: { onChange, onBlur, value = "" }, fieldState: { error } }) => (
          <SelectorInput
            label="Cédula de Identidad"
            selectedValue={getValues('documentType') || 'V'} // Lee el valor real del formulario
            value={value}                // Muestra directamente el string limpio numérico de React Hook Form
            onBlur={onBlur}
            keyboardType="numeric"
            error={error?.message}
            onSelect={(newType) => {
              setValue('documentType', newType); // Sincroniza el cambio con react-hook-form
            }}
            onChangeText={(newNumber) => {
              const clean = newNumber.replace(/\D/g, "");
              onChange(clean);
            }}
            options={['V', 'E']}
          />
        )}
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
            rules={{ required: 'El género es requerido' }}
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
            
                            setValue('gender', option.value); // Asegura que el número llegue al padre
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
        </View>
      </View>
    );
  }

  // Paso 3: Seguridad y Términos
  if (step === 3) {
    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
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
                <AppText variant="label" style={{ color: theme.colors.textPrimary }}>
                  Acepto los{' '}
                  <AppText
                    variant="label"
                    style={{
                      color: theme.colors.primary,
                      textDecorationLine: 'underline',
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
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  stepContent: {
    width: '100%',
  },
  hidden: {
    display: 'none',
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
  phoneFieldWrapper: {
    width: '100%',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  countryPickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 6,
    gap: 4,
    marginTop: 4,
  },
  countryText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: theme.colors.surface || '#fff',
    borderRadius: 12,
    padding: 8,
    elevation: 20,
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  genderWrapper: {
    marginTop: theme.spacing.s8,
    zIndex: 1000,
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
  },
});