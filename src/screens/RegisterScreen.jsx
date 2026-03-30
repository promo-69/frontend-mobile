import { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { ChevronLeft, Calendar, EyeOff, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { AppText } from '../components/AppText';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SelectorInput } from '../components/ui/SelectorInput';
import Logo from '../components/ui/Icons/Logo';
import { theme } from '../constants';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    names: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    cedula: '',
    dateBirth: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step === 1) setStep(2);
    else {
      console.log('Procesando Registro en CinexFlix:', formData);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
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
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeft size={28} color={theme.colors.border} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Logo width={180} height={45} viewBox="0 0 187 43" />
          </View>

          <View style={styles.mainContainer}>

            <AppText variant="h1" style={styles.title}>Registro</AppText>
            <AppText style={styles.subtitle}>
              Crea tu cuenta para comenzar
            </AppText>

            {/* Stepper (Indicador de Progreso) */}
            <View style={styles.stepper}>
              <View style={[styles.dot, step === 1 ? styles.activeDot : styles.inactiveDot]} />
              <View style={[styles.dot, step === 2 ? styles.activeDot : styles.inactiveDot]} />
            </View>

            {/* Campos del Formulario */}
            <View style={styles.formFields}>
              {step === 1 ? (
                <StepOne data={formData} onChange={updateForm} />
              ) : (
                <StepTwo data={formData} onChange={updateForm} />
              )}
            </View>

            {/* Botón y Enlace a Login */}
            <View style={styles.footer}>
              <Button 
                title="Continuar" 
                onPress={handleNext}
                disabled={step === 2 && !formData.acceptTerms}
              />
              
              <View style={styles.loginRedirect}>
                <AppText style={styles.footerText}>¿Ya tienes una cuenta? </AppText>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <AppText style={styles.link}>Iniciar Sesión</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}


const StepOne = ({ data, onChange }) => (
  <View style={styles.stepGap}>
    <Input placeholder="Nombres" value={data.names} onChangeText={(v) => onChange('names', v)} />
    <Input placeholder="Apellidos" value={data.lastName} onChangeText={(v) => onChange('lastName', v)} />
    <Input placeholder="Correo" keyboardType="email-address" value={data.email} onChangeText={(v) => onChange('email', v)} />
    <Input placeholder="Teléfono Móvil" keyboardType="phone-pad" value={data.phoneNumber} onChangeText={(v) => onChange('phoneNumber', v)} />
  </View>
);

const StepTwo = ({ data, onChange }) => (
  <View style={styles.stepGap}>
    <SelectorInput 
      value={data.cedula} 
      onChangeText={(v) => onChange('cedula', v)} 
    />
    <Input 
      placeholder="Fecha de Nacimiento" 
      icon={<Calendar size={20} color={theme.colors.primary} />} 
    />
    <Input 
      placeholder="Contraseña" 
      secureTextEntry 
      icon={<EyeOff size={20} color={theme.colors.primary} />} 
    />
    <Input 
      placeholder="Confirmar Contraseña" 
      secureTextEntry 
      icon={<EyeOff size={20} color={theme.colors.primary} />} 
    />
    <TouchableOpacity 
      style={styles.checkboxWrapper} 
      onPress={() => onChange('acceptTerms', !data.acceptTerms)}
      activeOpacity={0.8}
    >
      <View style={[styles.checkbox, data.acceptTerms && styles.checkboxSelected]}>
        {data.acceptTerms && <Check size={14} color="white" />}
      </View>
      <AppText style={styles.checkboxText}>
        Acepto los <AppText style={styles.link}>Términos y Condiciones</AppText>
      </AppText>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  scrollContent: { 
    flexGrow: 1,
    paddingBottom: 40,
    paddingTop: 40,
  },
  backButton: { 
    width: 40, 
    height: 40, 
    marginTop: theme.spacing.s8,
    marginLeft: theme.spacing.s16,
    backgroundColor: 'transparent', 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  logoContainer:{ 
    alignItems: 'center',
    marginTop: theme.spacing.s16,
  },
  mainContainer: { 
    paddingHorizontal: 25, 
    alignItems: 'center' 
  },
  title: { 
    color: theme.colors.primary, 
    ...theme.typography.variants.h2, 
  },
  stepper: { 
    flexDirection: 
    'row', 
    gap: 10, 
    marginVertical: 20 
  },
  dot: { 
    width: 12, 
    height: 12, 
    borderRadius: 6 
  },
  activeDot: { 
    backgroundColor: theme.colors.primary 
  },
  inactiveDot: { 
    backgroundColor: theme.colors.gold[50] 
  },
  formFields: { width: '100%' },
  stepGap: { gap: 12 },
  footer: { 
    width: '100%', 
    marginTop: 30, 
    paddingBottom: 50 
  },
  loginRedirect: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 20 
  },
  footerText: { 
    color: theme.colors.textSecondary,
      ...theme.typography.variants.label
   },
  link: { 
    color: theme.colors.primary, 
    ...theme.typography.variants.label,
    textDecorationLine: 'underline' 
  },
  checkboxWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 15, 
    gap: 12 
  },
  checkbox: { 
    width: 24, 
    height: 24, 
    borderWidth: 2, 
    borderColor: theme.colors.primary, 
    borderRadius: 6, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  checkboxSelected: { backgroundColor: theme.colors.primary },
  checkboxText: { 
    color: 'white', 
    ...theme.typography.variants.label 
  }
});