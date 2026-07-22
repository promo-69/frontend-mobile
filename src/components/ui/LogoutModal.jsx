import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { theme } from '../../constants';
import { AppText } from './AppText';

export const LogoutModal = ({ visible, onConfirm, onCancel, onClose, loading }) => {
  const handleCancel = onCancel ?? onClose;

  const handleClose = () => {
    if (loading) return;
    if (handleCancel) handleCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.iconContainer}>
            <LogOut size={28} color={theme.colors.primary} />
          </View>
          <AppText variant="h2" style={styles.title}>
            Cerrar Sesión
          </AppText>
          <AppText variant="body" style={styles.description}>
            ¿Estás seguro de que deseas salir de tu cuenta? Perderás el acceso a
            tus funciones personalizadas.
          </AppText>

          <Pressable
            style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
            onPress={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <AppText variant="button" style={styles.confirmButtonText}>
                Cerrar sesión
              </AppText>
            )}
          </Pressable>

          <Pressable style={styles.cancelButton} onPress={handleClose} disabled={loading}>
            <AppText variant="button" style={[styles.cancelButtonText, loading && styles.buttonTextDisabled]}>
              Mantener sesión
            </AppText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.s16,
  },
  card: {
    backgroundColor: theme.colors.background.main || '#231640',
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: theme.spacing.s32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  iconContainer: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(217, 152, 47, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.s16,
  },
  title: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.s8,
  },
  description: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: theme.spacing.s24,
    opacity: 0.8,
  },
  confirmButton: {
    backgroundColor: theme.colors.error,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: theme.spacing.s12,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'uppercase',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  buttonTextDisabled: {
    opacity: 0.3,
  },
});
