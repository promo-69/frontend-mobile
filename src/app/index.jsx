import { Redirect } from 'expo-router';

export default function AppRoot() {
  // Simulación de lógica de autenticación
  const userIsLoggedIn = false;

  if (!userIsLoggedIn) {
    // En Expo Router, las carpetas de grupo como `(home)` no se incluyen en la URL.
    return <Redirect href="/(home)/homemain" />;
  }
  // Si está logueado, lo mandamos al Home 
  //return <Redirect href="/(tabs)/home" />;
}
