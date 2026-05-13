import { useRouter } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import logotipo from '../../assets/logotipo.png'
import { CustomButton } from '../../components/ui/CustomButton'

export default function EmailCheck() {
  const router = useRouter();

  const [isVerifying, setIsVerifying] = useState(false);

  const handleContinue = () => {
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      router.replace('/auth/movieGenres');
    }, 1500);
    
  };

  return (
    <SafeAreaView>
      <View>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Image 
            source={logotipo}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text>
          ¡Revisa tu bandeja de entrada!
        </Text>

        <Text>
          Te enviamos un correo para validar y culminar tu registro. Si no lo ves, revisa tu carpeta de spam.
        </Text>
        <View>
          <CustomButton>
            text="Continuar"
            onPress={handleContinue}
            loading={isVerifying}
            disabled={isVerifying}
          </CustomButton>
        </View>


      </View>
   
      <Text>EmailCheck</Text>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  container:{
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logo: {
    width: 240, 
    height: 80,
    marginBottom: 40,
  },
  buttonWrapper: {
    width: '100%',
  },
})