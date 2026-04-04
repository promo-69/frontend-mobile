import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppText } from '../../components/AppText';
import { PersonalInfoSteps } from '../../components/PersonalInfoSteps'; // Importamos el orquestador
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { StepIndicator } from '../../components/ui/StepIndicator';
import { theme } from '../../constants';

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const {
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onBlur',
    revalidateMode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      documentNumber: '',
      documentType: 'V',
      dateBirth: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      favoriteGenres: [],
    },
  });

  // Lógica para avanzar de paso
  const handleNext = async () => {
    let fieldsToValidate = [];

    if (step === 1) fieldsToValidate = [
      'firstName', 
      'lastName', 
      'email',
      'phoneNumber'
    ];
    if (step === 2)
      fieldsToValidate = [
        'documentNumber',
        'dateBirth',
        'password',
        'confirmPassword',
        'acceptTerms',
      ];
    if (step === 3) fieldsToValidate = ['favoriteGenres'];

    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        handleSubmit(onSubmit)();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  const onSubmit = async (data) => {
    try {
      console.log('Finalizando Registro', data);
      // lógica de API
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
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
              setValue={setValue}
              watch={watch}
            />
          </View>

          <View style={styles.footer}>
            <Button
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
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
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
    flex: 1,
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
