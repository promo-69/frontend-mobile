import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  User,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppText } from '../../../components/AppText';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { LogoutModal } from '../../../components/ui/LogoutModal';
import { theme } from '../../../constants';
import { useAuth } from '../../../context/AuthContext';
import { useProfile } from '../../../hooks/profile/useProfile';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { profile, loading } = useProfile();

  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  if (loading) {
    return (
      <ScreenWrapper style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ScreenWrapper>
    );
  }

  const userInitials = (() => {
    const firstLetter = user?.firstName?.trim()?.charAt(0) || '';
    const lastLetter = user?.lastName?.trim()?.charAt(0) || '';

    const initials = `${firstLetter}${lastLetter}`.toUpperCase();

    // Fallback de seguridad: Si por alguna razón no hay datos aún, muestra una inicial genérica
    return initials || 'U';
  })();

  // Helper para renderizar cada fila/opción del menú de manera limpia
  const renderMenuItem = ({ icon: Icon, title, onPress, rightComponent }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={!!rightComponent}
    >
      <View style={styles.menuItemLeft}>
        <Icon
          size={22}
          color={theme.colors.textSecondary || '#FFFFFF'}
          style={styles.menuIcon}
        />
        <AppText variant="body" style={styles.menuItemText}>
          {title}
        </AppText>
      </View>
      {rightComponent ? (
        rightComponent
      ) : (
        <ChevronRight size={20} color="rgba(255,255,255,0.3)" />
      )}
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    setIsLogoutModalVisible(false);
    await logout();
    router.replace('/(main)/home');
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={28} color={theme.colors.border} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>
          Mi Perfil
        </AppText>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sección de Tarjeta de Usuario Resumida */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <AppText variant="h2" style={styles.avatarText}>
              {userInitials}
            </AppText>
          </View>
          <View style={styles.userInfo}>
            <AppText variant="h3" style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </AppText>
            <AppText variant="body" style={styles.userEmail}>
              {user?.email}
            </AppText>
          </View>
        </View>

        {/* --- CONFIGURACIÓN DE CUENTA --- */}
        <AppText variant="small" style={styles.categoryTitle}>
          Account Settings
        </AppText>
        <View style={styles.menuGroup}>
          {renderMenuItem({
            icon: User,
            title: 'Datos Personales',
            onPress: () => router.push('/profile/personal-data'),
          })}
          {renderMenuItem({
            icon: ShieldCheck,
            title: 'Seguridad',
            onPress: () => router.push({ pathname: '/profile/security' }),
          })}
          {renderMenuItem({
            icon: LogOut,
            title: 'Logout',
            onPress: () => setIsLogoutModalVisible(true),
          })}
        </View>

        {/* --- CATEGORÍA 2: CONFIGURACIÓN DE APP --- 
        <AppText variant="small" style={styles.categoryTitle}>App Settings</AppText>
        <View style={styles.menuGroup}>
          {renderMenuItem({ icon: Globe, title: 'Language', onPress: () => alert('Próximamente') })}
          {renderMenuItem({ icon: Bell, title: 'Notification', onPress: () => alert('Próximamente') })}
        </View>

        {/* --- CATEGORÍA 3: SOPORTE --- 
        <AppText variant="small" style={styles.categoryTitle}>Support</AppText>
        <View style={styles.menuGroup}>
          {renderMenuItem({ icon: HelpCircle, title: 'Help Center', onPress: () => alert('Próximamente') })}
        </View>*/}
      </ScrollView>

      {/* Modal de confirmación de deslogueo */}
      <LogoutModal
        visible={isLogoutModalVisible}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalVisible(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s16,
    paddingTop: theme.spacing.s8,
    marginBottom: theme.spacing.s8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    color: theme.colors.primary,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.s24,
    paddingBottom: theme.spacing.s40,
  },

  // Tarjeta superior del usuario
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.s24,
    padding: theme.spacing.s16,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginBottom: theme.spacing.s12,
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  userInfo: {
    marginLeft: theme.spacing.s16,
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  userEmail: {
    color: theme.colors.textSecondary,
    opacity: 0.6,
    fontSize: 13,
    marginTop: 2,
  },

  // Agrupadores de menús
  categoryTitle: {
    color: theme.colors.textSecondary,
    opacity: 0.4,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: theme.spacing.s8,
    marginLeft: 4,
  },
  menuGroup: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: theme.spacing.s24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.s16,
    paddingHorizontal: theme.spacing.s16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: theme.spacing.s16,
    opacity: 0.8,
  },
  menuItemText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
});
