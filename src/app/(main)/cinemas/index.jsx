import { View, StyleSheet } from 'react-native';
import { AppText } from '../../../components/AppText';
import { ScreenWrapper } from '../../../components/ScreenWrapper';

export default function CinemasScreen() {
  return (
    <ScreenWrapper style={styles.container}>
      <AppText variant="h2">Cines</AppText>
      <AppText variant="body">Selección de salas y complejos (Próximamente)</AppText>
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