import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

const Banner = ({ bannerUrl }) => {
  if (!bannerUrl) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Image
        source={{ uri: bannerUrl }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        blurRadius={8}
        transition={400}
      />
      <View style={styles.overlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(35, 22, 64, 0.2)',
  },
});

export default Banner;
