import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Mail, Lock, ChevronRight } from 'lucide-react-native';
import { AppText } from '../../../../components/ui/AppText';
import { ScreenWrapper } from '../../../../components/ui/ScreenWrapper';
import { theme } from '../../../../constants';

export default function SecurityIndexScreen() {
  const router = useRouter();

  const renderMenuItem = ({ icon: Icon, title, description, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          <Icon size={20} color={theme.colors.accent} />
        </View>
        <View style={styles.menuItemTextWrap}>
          <AppText variant="body" style={styles.menuItemTitle}>
            {title}
          </AppText>
          <AppText variant="caption" style={styles.menuItemDesc}>
            {description}
          </AppText>
        </View>
      </View>
      <ChevronRight size={20} color="rgba(255,255,255,0.3)" />
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AppText variant="body" style={styles.description}>
          Selecciona la opción de seguridad que deseas modificar. Por motivos de seguridad, se te solicitará tu contraseña actual.
        </AppText>

        <View style={styles.menuGroup}>
          {renderMenuItem({
            icon: Mail,
            title: 'Cambiar Correo Electrónico',
            description: 'Actualiza la dirección de correo asociada a tu cuenta.',
            onPress: () => router.push('/profile/security/change-email'),
          })}
          {renderMenuItem({
            icon: Lock,
            title: 'Cambiar Contraseña',
            description: 'Actualiza tu contraseña periódicamente para mayor seguridad.',
            onPress: () => router.push('/profile/security/change-password'),
          })}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: theme.spacing.s24,
    paddingTop: theme.spacing.s16,
    paddingBottom: theme.spacing.s32,
  },
  description: {
    color: theme.colors.textSecondary,
    opacity: 0.6,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: theme.spacing.s24,
  },
  menuGroup: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.s20,
    paddingHorizontal: theme.spacing.s16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(240, 177, 42, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.s16,
  },
  menuItemTextWrap: {
    flex: 1,
    gap: 2,
  },
  menuItemTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  menuItemDesc: {
    color: theme.colors.textSecondary,
    opacity: 0.6,
    fontSize: 12,
  },
});
