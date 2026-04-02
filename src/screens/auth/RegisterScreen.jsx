import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { AccountDetailsStep } from '../../components/AccountDetailsStep';
import { AppText } from '../../components/AppText';
import { GenreSelectionStep } from '../../components/GenreSelectionStep';
import { PersonalInfoStep } from '../../components/PersonalInfoStep';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { StepIndicator } from '../../components/ui/StepIndicator';
import { theme } from '../../constants';

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    documentType: 'V',
    phoneNumber: '',
    documentNumber: '',
    dateBirth: '',
    dateBirthRaw: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    genres: [],
  });

  const updateForm = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleToggleGenre = (genre) => {
    const currentGenres = formData.genres;
    const isSelected = currentGenres.includes(genre);
    const nextGenres = isSelected
      ? currentGenres.filter((g) => g !== genre)
      : [...currentGenres, genre];

    updateForm('genres', nextGenres);
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (formData.genres.length < 3) {
        setErrors({ genres: 'Selecciona al menos 3 géneros' });
        return;
      }
      console.log('Finalizando Registro CineFlix:', formData);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/** 
         * <View style={styles.navHeader}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ChevronLeft size={28} color={theme.colors.primary} />
            </TouchableOpacity>
            <Logo width={120} height={30} />
            <View style={{ width: 40 }} />
          </View>
        */}

          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeft size={28} color={theme.colors.border} />
          </TouchableOpacity>

          <View style={styles.mainContainer}>
            <AppText variant="h2" style={styles.title}>
              Registro
            </AppText>

            <StepIndicator currentStep={step - 1} totalSteps={3} />

            <View style={styles.formFields}>
              {step === 1 && (
                <PersonalInfoStep
                  formData={formData}
                  onInputChange={updateForm}
                />
              )}
              {step === 2 && (
                <AccountDetailsStep
                  formData={formData}
                  onInputChange={updateForm}
                  errors={errors}
                />
              )}
              {step === 3 && (
                <GenreSelectionStep
                  selectedGenres={formData.genres}
                  onToggleGenre={handleToggleGenre}
                  error={errors.genres}
                />
              )}
            </View>

            <View style={styles.footer}>
              <Button
                title={step === 3 ? 'Finalizar' : 'Continuar'}
                onPress={handleNext}
                disabled={step === 2 && !formData.acceptTerms}
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
    paddingTop: 8,
    flexGrow: 1,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    marginTop: theme.spacing.s8,
    marginLeft: theme.spacing.s16,
    justifyContent: 'center',
  },
  mainContainer: {
    paddingHorizontal: 25,
    marginTop: 10,
  },
  title: {
    color: theme.colors.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  formFields: {
    width: '100%',
    marginTop: 20,
  },
  footer: {
    width: '100%',
    marginTop: 30,
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
