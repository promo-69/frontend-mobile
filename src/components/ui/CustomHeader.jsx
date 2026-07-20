import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { theme } from '../../constants';
import { AppText } from './AppText';

export const CustomHeader = ({ title, rightComponent, onPressAction }) => {
  const router = useRouter();

  const handleDefaultBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(main)/home');
    }
  };

  return (
    <View style={styles.headerContainer}>
      {/* Botón de Regresar condicional */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={onPressAction || handleDefaultBack}
        activeOpacity={0.7}
      >
        <ArrowLeft size={22} color={theme.colors.accent} strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Título de la pantalla */}
      <View style={styles.titleContainer}>
        {title && <AppText style={styles.headerTitle}>{title}</AppText>}
      </View>

      {/* Espacio para un botón extra a la derecha si fuese necesario (ej. Guardar o un ícono) */}
      <View style={styles.rightContainer}>
        {rightComponent ? rightComponent : <View style={{ width: 28 }} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.midnight[800],
    height: 56,
    paddingHorizontal: theme.spacing.s16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.size.s18,
    fontWeight: 'bold',
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
});
