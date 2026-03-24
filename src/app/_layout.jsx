import { Image, StyleSheet, Text, View } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    MainBold : require('../assets/fonts/Montserrat-Bold.ttf'),
    MainRegular: require('../assets/fonts/Montserrat-Regular.ttf'),
    MainSemiBold: require('../assets/fonts/Montserrat-SemiBold.ttf'),
    MainMedium: require('../assets/fonts/Montserrat-Medium.ttf'),
    DisplayRegular: require('../assets/fonts/BebasNeue-Regular.ttf'),
  });

  //Corre una vez cundo el componente se monta
  useEffect(()=>{
    //previene que la splash screen se quite antes de que las fuentes se hayan cargado
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }
    prepare();
  }, []);

  //quita la splash screen cuando se cargen las fuentes
  const onLayout = useCallback(async () => {
    if(fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]); //cade que el estado de las fuentes cambie

  if(!fontsLoaded) return null;

  return (
    <View style={styles.container} onLayout={onLayout}>
      <Image
        source={require('../assets/images/react-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={{ fontFamily: "DisplayRegular", fontSize: 32 }}>PROMO 69</Text>
      <Text style={{ fontFamily: "MainBold", fontSize: 32 }}>PROMO 69</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 140,
    height: 140,
    opacity: 0.95,
    marginBottom: 16,
  },
  description: {
    fontSize: 20,
    color: '#333333',
    textAlign: 'center',
  },
});
