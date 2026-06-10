import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function MovieSkeleton({ variant = 'details' }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  if (variant === 'card') {
    return (
      <View style={styles.cardContainer}>
        <Animated.View style={[styles.cardPoster, { opacity }]} />
        <View style={{ marginTop: 8 }}>
          <Animated.View style={[styles.cardTitle, { opacity }]} />
          <Animated.View style={[styles.cardSubtitle, { opacity }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.hero, { opacity }]} />
      <View style={styles.content}>
        <Animated.View style={[styles.title, { opacity }]} />
        <Animated.View style={[styles.techSheet, { opacity }]} />
        <Animated.View style={[styles.textLine, { opacity, width: '100%' }]} />
        <Animated.View style={[styles.textLine, { opacity, width: '80%' }]} />
        <Animated.View style={[styles.textLine, { opacity, width: '60%' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#231640' },
  hero: {
    width: '100%',
    height: width * 1.1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  content: { padding: 20 },
  title: {
    height: 40,
    width: '70%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    marginBottom: 20,
  },
  techSheet: {
    height: 150,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    marginBottom: 25,
  },
  textLine: {
    height: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    marginBottom: 10,
  },
  cardContainer: { width: 150, marginRight: 16 },
  cardPoster: {
    width: 150,
    height: 225,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cardTitle: { height: 14, width: '80%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: 4 },
  cardSubtitle: { height: 10, width: '50%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4 },
});
