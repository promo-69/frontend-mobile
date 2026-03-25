import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/index';

export const ScreenWrapper = ({ children, style }) => {
  return (
    <View style={styles.container}>
      {/* Configuramos la barra de estado para que sea legible en fondo oscuro */}
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={theme.colors.gradients.glowPurple.colors}
        locations={theme.colors.gradients.glowPurple.locations}
        style={StyleSheet.absoluteFill} // Ocupa todo el fondo detrás del contenido
      />

      <SafeAreaView style={[styles.safeArea, style]}>
        {children}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Fallback si el gradiente falla
  },
  safeArea: {
    flex: 1,

    // Aquí podrías agregar un padding horizontal base si quieres 
    // que todas las pantallas respeten el margen de 16pt (theme.spacing.md)
  },
});