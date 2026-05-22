import { View, StyleSheet } from 'react-native';
import { AppText } from '../../../components/AppText';
import { ScreenWrapper } from '../../../components/ScreenWrapper';

export default function LoyaltyRewardsScreen() {
  return (
    <ScreenWrapper style={styles.container}>
      <AppText variant="h2">Premios</AppText>
      <AppText variant="body">Catálogo de canje por puntos (Funciones/Combos bloqueados/desbloqueados)
      </AppText>
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