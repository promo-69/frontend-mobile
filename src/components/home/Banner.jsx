import { View, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';

export const Banner = ({ movie }) => {
  if (!movie) return null;
  
  return (
    <View style={StyleSheet.absoluteFill}>
      <Image
        source={{ uri: movie.banner }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        blurRadius={20} 
      />
      <View style={styles.overlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(35, 22, 64, 0.7)',
  },
});