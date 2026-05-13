import { CheckCircle2 } from 'lucide-react-native'
import { useEffect, useRef } from 'react'
import { Animated, BackHandler, StyleSheet, View } from 'react-native'
import { AppText } from '../../components/AppText'
import { CustomButton } from '../../components/ui/CustomButton'
import { theme } from '../../constants'

export const SuccessScreen = ({ 
  title, 
  message, 
  buttonText = "Continuar", 
  onPress 
}) => {
  
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Bloquear el botón de atrás físico en Android para que no regresen al formulario
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);

   
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <CheckCircle2 
          size={100} 
          color={theme.colors.primary} 
          strokeWidth={1.5} 
        />
      </Animated.View>

      <View style={styles.textContainer}>
        <AppText variant="h2" style={styles.title}>{title}</AppText>
        <AppText variant="body" style={styles.message}>{message}</AppText>
      </View>

      <CustomButton 
        title={buttonText} 
        onPress={onPress} 
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 50,
  },
  title: {
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    width: '100%',
  },
});