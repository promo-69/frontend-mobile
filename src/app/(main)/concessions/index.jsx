import { View, StyleSheet } from 'react-native';
import { AppText } from '../../../components/AppText';
import { ScreenWrapper } from '../../../components/ScreenWrapper';

export default function ConcessionsScreen() {
  return (
    <ScreenWrapper style={styles.container}>
      <AppText variant="h2">Dulces y Combos</AppText>
      <AppText variant="body">Cátalogo de Dulces y Combos</AppText>
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