import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/index';

export const ScreenWrapper = ({ children, style }) => {
  return (
    <View style={styles.container}>
     
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        {...theme.colors.gradients.glowPurple}
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
    backgroundColor: theme.colors.background, 
  },
  safeArea: {
    flex: 1,
  },
});