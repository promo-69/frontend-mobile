import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../constants/index';

export const ScreenWrapper = ({ children, style, disableSafeArea = false }) => {
  const Container = disableSafeArea ? View : SafeAreaView;

  return (
    <LinearGradient
      {...theme.colors.gradients.bgColor}
      style={styles.container}
    >
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <Container style={[styles.safeArea, style]}>{children}</Container>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
