import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ZoomableContainer({ children }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // 1. Gesto de Pellizco (Pinch to Zoom)
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      // Limitamos el zoom entre 1x y 2.5x para no perder el mapa de vista
      scale.value = Math.max(1, Math.min(savedScale.value * event.scale, 2.5));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // 2. Gesto de Arrastre (Desplazamiento por la sala expandida)
  const panGesture = Gesture.Pan()
    .minPointers(1) // Permite mover la sala
    .onUpdate((event) => {
      // Solo permitimos desplazamiento si el usuario ya aplicó zoom para evitar rebotes molestos a escala 1x
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Combinamos ambos gestos para que se puedan realizar en paralelo de forma fluida
  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.wrapper, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    flex: 1,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
