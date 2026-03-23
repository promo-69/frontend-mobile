import { Image, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/react-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.description}>PROMO 69</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 140,
    height: 140,
    opacity: 0.95,
    marginBottom: 16,
  },
  description: {
    fontSize: 20,
    color: '#333333',
    textAlign: 'center',
  },
});
