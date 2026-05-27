import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
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
import { storageHelper } from '../../helper/storage.helper'


export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 3;


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

    // Paso 1: Datos básicos
  if (step === 1) {
    fieldsToValidate = ['firstName', 'lastName', 'email', 'phoneNumber'];
  }
  // Paso 2: Datos de identidad
  if (step === 2) {
    fieldsToValidate = [
      'documentNumber',
      'birthDate',
      'gender',
    ];
  }

   if (step === 3) { fieldsToValidate = [
      'password',
      'confirmPassword',
      'acceptTerms',
     ];
     }

   /* if (step === 1)
      fieldsToValidate = ['firstName', 'lastName', 'email', 'phoneNumber'];
    if (step === 2)
      fieldsToValidate = [
        'documentNumber',
        'birthDate',
        'gender',
        'password',
        'confirmPassword',
        'acceptTerms',
      ];
    if (step === 3) fieldsToValidate = ['favoriteGenres'];
    */

    //devuelve true si todos los campos pasan las validaciones
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
      
     let formattedBirthDate = '';

     if (data.birthDate) {
        if (data.birthDate.includes('/')) {
          const [day, month, year] = data.birthDate.split('/');
          formattedBirthDate = `${year}-${month}-${day}`;
        } else {
          formattedBirthDate = data.birthDate; 
        }
    }*/

      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        documentNumber: data.documentNumber,
        phoneNumber: data.phoneNumber,
        gender: Number(data.gender),
        birthDate: data.birthDate ,
      };

      const result = await register(payload);
      
    /*  console.log('📦 [Payload Final que sale al servicio de registro]:', JSON.stringify(payload, null, 2));*/

      if (!result?.success) {
        console.error('Error en registro:', result?.message);
        return;
      }

      //Guardamos de forma segura/persistente el correo para usarlo en la siguiente pantalla
      // Usamos AsyncStorage indirectamente a través del formato de STORAGE_KEYS
      await AsyncStorage.setItem('user_email_to_verify', data.email);
      router.replace('/(auth)/register-verify');

    } catch (error) {
      console.error(error);
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
