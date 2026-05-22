import { View, StyleSheet } from 'react-native';
import { AppText } from '../../../components/AppText';
import { ScreenWrapper } from '../../../components/ScreenWrapper';

export default function BillboardScreen() {
  return (
    <ScreenWrapper style={styles.container}>
      <AppText variant="h2">Cartelera</AppText>
      <AppText variant="body">Cátalogo de Películas</AppText>
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