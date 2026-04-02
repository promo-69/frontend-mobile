import { Check } from 'lucide-react-native';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants';
import { AppText } from './AppText';
import { DateInput } from './ui/DateInput';
import { Input } from './ui/Input';
import { SelectorInput } from './ui/SelectorInput';

/**
 * @param {Object} formData - Datos de cuenta: { username, password, confirmPassword }
 * @param {Function} onInputChange - Callback (key: string, value: string) => void
 * @param {Object} errors - Errores específicos por campo (micro-validaciones)
 */
export const AccountDetailsStep = ({
  formData,
  onInputChange,
  errors = {},
}) => {
  const handleDateSelection = (display, standardDate) => {
    onInputChange('dateBirth', display);
    onInputChange('dateBirthRaw', standardDate);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formContainer}>
        <SelectorInput
          label="Cédula de Identidad"
          value={formData.documentNumber}
          onChangeText={(v) => onInputChange('documentNumber', v)}
          onSelect={(val) => onInputChange('documentType', val)}
          error={errors.documentNumber}
        />

        <DateInput
          label="Fecha de Nacimiento (DD/MM/AAAA)"
          value={formData.dateBirth}
          error={errors.dateBirth}
          onChange={handleDateSelection}
        />

        <Input
          label="Contraseña"
          value={formData.password}
          onChangeText={(text) => onInputChange('password', text)}
          error={errors.password}
          secureTextEntry
        />

        <Input
          label="Confirmar contraseña"
          value={formData.confirmPassword}
          onChangeText={(text) => onInputChange('confirmPassword', text)}
          error={errors.confirmPassword}
          secureTextEntry
        />

        <View style={styles.termsSection}>
          <TouchableOpacity
            style={styles.checkboxWrapper}
            onPress={() => onInputChange('acceptTerms', !formData.acceptTerms)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.checkbox,
                formData.acceptTerms && styles.checkboxSelected,
                errors.acceptTerms && { borderColor: theme.colors.error },
              ]}
            >
              {formData.acceptTerms && <Check size={14} color="white" />}
            </View>

            <View style={styles.textContainer}>
              <AppText variant="label" style={styles.checkboxText}>
                Acepto los{' '}
                <AppText variant="label" style={styles.link}>
                  Términos y Condiciones
                </AppText>
              </AppText>
            </View>
          </TouchableOpacity>
          {/* Error específico para el checkbox */}
          {errors.acceptTerms && (
            <AppText style={styles.errorLabel}>{errors.acceptTerms}</AppText>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: theme.spacing.s32,
  },
  formContainer: {
    gap: theme.spacing.s24,
  },
  termsSection: {
    marginTop: theme.spacing.s8,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.s12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
  },
  textContainer: {
    flex: 1,
  },
  checkboxText: {
    color: theme.colors.textPrimary,
    ...theme.typography.variants.label,
    lineHeight: 20,
  },
  link: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  errorLabel: {
    color: theme.colors.error,
    ...theme.typography.variants.caption,
    marginTop: theme.spacing.s4,
    marginLeft: 36,
  },
});
