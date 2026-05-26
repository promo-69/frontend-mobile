import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import logotipo from '../../assets/logotipo.png';
import { CustomButton } from '../../components/ui/CustomButton';
import { useAuth } from '../../context/AuthContext';
import { SuccessScreen } from '../shared/SuccessScreen'; 
import { theme } from '../../constants';

export default function EmailCheck() {
  const router = useRouter();
  const { verifyAccount } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Estado para el código de 4 dígitos e inputs referenciados
  const [code, setCode] = useState(['', '', '', '']);
  const inputsRef = useRef([]);

  // Cargar el correo del usuario persistido tras el registro
  useEffect(() => {
    const getSavedEmail = async () => {
      const savedEmail = await AsyncStorage.getItem('user_email_to_verify');
      if (savedEmail) {
        setEmail(savedEmail);
      } else {
        Alert.alert("Aviso", "No se encontró un correo pendiente de verificación.");
        router.replace('/register');
      }
    };
    getSavedEmail();
  }, []);

  // Efecto para redirigir al Login después de ver la pantalla de Éxito
  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  const handleChangeText = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Salto automático al siguiente recuadro
    if (text.length === 1 && index < 3) {
      inputsRef.current[index + 1].focus();
    }

    // Si completó los 4 casilleros, ejecutamos la función de continuar automáticamente
    if (newCode.every(digit => digit !== '')) {
      handleContinue(newCode.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    // Si borra, regresa al input anterior
    if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleContinue = async (fullCode) => {
    const finalCode = typeof fullCode === 'string' ? fullCode : code.join('');
    
    if (finalCode.length < 4) {
      Alert.alert("Código incompleto", "Por favor ingresa los 4 dígitos.");
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyAccount(email, finalCode);

      if (result.success) {
        // Limpiamos el correo temporal ya verificado de la persistencia
        await AsyncStorage.removeItem('user_email_to_verify');
        // Activamos la pantalla de felicitaciones
        setShowSuccess(true);
      } else {
        Alert.alert("Verificación fallida", result.message || "Código incorrecto.");
        setCode(['', '', '', '']);
        inputsRef.current[0].focus();
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un problema al conectar con el servidor.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Si completó el flujo con éxito, renderizamos tu SuccessScreen tal como deseas
  if (showSuccess) {
    return (
      <SuccessScreen
        title="¡Cuenta Verificada!"
        message="Tu correo electrónico ha sido validado correctamente. Ya puedes iniciar sesión con tus credenciales."
        onPress={() => router.replace('/login')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Image source={logotipo} style={styles.logo} resizeMode="contain" />
        </TouchableOpacity>

        <Text style={styles.title}>¡Revisa tu bandeja de entrada!</Text>
        <Text style={styles.subtitle}>
          Te enviamos un código de 4 dígitos a <Text style={{fontWeight: 'bold'}}>{email || 'tu correo'}</Text> para validar y culminar tu registro.
        </Text>

        {/* Inputs de 4 dígitos */}
        <View style={styles.otpContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={1}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              value={digit}
              ref={(ref) => (inputsRef.current[index] = ref)}
              editable={!isVerifying}
            />
          ))}
        </View>

        <View style={styles.buttonWrapper}>
          <CustomButton
            title="Verificar Código"
            onPress={handleContinue}
            loading={isVerifying}
            disabled={isVerifying || code.some(d => d === '')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  logo: {
    width: 240,
    height: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme?.colors?.primary || '#231640',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  otpInput: {
    width: 55,
    height: 55,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 12,
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
    backgroundColor: '#f9f9f9',
  },
  buttonWrapper: {
    width: '100%',
  },
});