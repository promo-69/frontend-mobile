import { Redirect } from 'expo-router';

export default function AppRoot() {
  // Simulación de lógica de autenticación
  const userIsLoggedIn=false;

  if(!userIsLoggedIn){
    return <Redirect href="/(auth)/login" />
  }
  // Si está logueado, lo mandamos al Home 
  //return <Redirect href="/(tabs)/home" />;
}
