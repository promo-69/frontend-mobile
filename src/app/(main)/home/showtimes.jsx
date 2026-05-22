import { View, StyleSheet } from 'react-native';
import { AppText } from '../../../components/AppText';
import { ScreenWrapper } from '../../../components/ScreenWrapper';

export default function ShowtmesScreen() {
  return (
    <ScreenWrapper style={styles.container}>
      <AppText variant="h2">Funciones</AppText>
      <AppText variant="body">Seleccion funciones de la pelicula (Horario y Salas)</AppText>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});