import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../constants/index';

export const ScreenWrapper = ({ children, style }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient {...theme.colors.gradients.bgColor} />

      <SafeAreaView style={[styles.safeArea, style]}>{children}</SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
});
