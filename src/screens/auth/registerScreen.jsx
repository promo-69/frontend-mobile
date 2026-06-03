import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppText } from '../../components/AppText';
import { PersonalInfoSteps } from '../../components/PersonalInfoSteps';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { CustomButton } from '../../components/ui/CustomButton';
import { StepIndicator } from '../../components/ui/StepIndicator';
import { theme } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { storageHelper } from '../../helper/storage.helper';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // 1. Estado de respaldo para garantizar al 100% que nada se borre al desmontar
  const [savedFormData, setSavedFormData] = useState({});

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onBlur',
    revalidateMode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      documentNumber: '',
      gender: '',
      documentType: 'V',
      birthDate: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  // Lógica para avanzar de paso
  const handleNext = async () => {
    let fieldsToValidate = [];

    if (step === 1) fieldsToValidate = ['firstName', 'lastName', 'email', 'phoneNumber'];
    if (step === 2) fieldsToValidate = ['documentNumber', 'birthDate', 'gender'];
    if (step === 3) fieldsToValidate = ['password', 'confirmPassword', 'acceptTerms'];

    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      // 2. RESPALDO CRUCIAL: Antes de cambiar de pantalla, extraemos los datos actuales
      // y los fusionamos con nuestro estado plano local.
      const currentValues = getValues();
      setSavedFormData((prev) => ({ ...prev, ...currentValues }));

      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        // Si es el último paso, llamamos formalmente al submit
        handleSubmit(onSubmit)();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  const onSubmit = async () => {
    try {
      // Combinamos lo que tiene React Hook Form al final con el respaldo local
      const finalForm = { ...savedFormData, ...getValues() };

      // Desestructuramos del objeto consolidado real
      const payload = {
        firstName: finalForm.firstName.trim(),
        lastName: finalForm.lastName.trim(),
        email: finalForm.email,
        password: finalForm.password,
        documentNumber: finalForm.documentNumber, // Ahora sí llegará el número
        phoneNumber: finalForm.phoneNumber,
        gender: finalForm.gender ? Number(finalForm.gender) : null,
        birthDate: finalForm.birthDate,           // Ahora sí llegará YYYY-MM-DD
      };

      const result = await register(payload);

      if (!result?.success) {
        console.log('Error en registro:', result?.message);
        return;
      }

      await storageHelper.saveValue('user_email_to_verify', finalForm.email);
      router.replace('/(auth)/register-verify');
    } catch (error) {
      console.error('Error en onSubmit:', error);
    }
  };
  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mainContainer}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ChevronLeft size={28} color={theme.colors.border} />
            </TouchableOpacity>

            <AppText variant="h2" style={styles.title}>
              Registro
            </AppText>

            <StepIndicator currentStep={step - 1} totalSteps={totalSteps} />

            <View style={styles.formFields}>
              <PersonalInfoSteps
                step={step}
                control={control}
                errors={errors}
                getValues={getValues}
                setValue={setValue}
              />
            </View>

            <View style={styles.footer}>
              <CustomButton
                title={step === totalSteps ? 'Finalizar' : 'Continuar'}
                onPress={handleNext}
                loading={isSubmitting}
              />

              {step === 1 && (
                <View style={styles.loginRedirect}>
                  <AppText style={styles.footerText}>
                    ¿Ya tienes una cuenta?{' '}
                  </AppText>
                  <TouchableOpacity onPress={() => router.push('/login')}>
                    <AppText style={styles.link}>Iniciar Sesión</AppText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    marginTop: theme.spacing.s8,
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  formFields: {
    marginTop: 20,
  },
  footer: {
    width: '100%',
    paddingBottom: 40,
    marginTop: 20,
  },
  loginRedirect: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: theme.colors.textSecondary,
    ...theme.typography.variants.label,
  },
  link: {
    color: theme.colors.primary,
    ...theme.typography.variants.label,
    textDecorationLine: 'underline',
  },
});
