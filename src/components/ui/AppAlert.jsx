import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { theme } from '../../constants';
import { AppText } from './AppText';

export const AppAlert = ({
  visible,
  title,
  message,
  icon: Icon = AlertCircle,
  variant = 'primary',
  confirmLabel = 'Aceptar',
  cancelLabel,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const isDanger = variant === 'danger';

  const handleDismiss = () => {
    if (loading) return;
    // Tocar fuera cierra por el camino "cancelar" si existe; si no, confirma el aviso.
    if (onCancel) onCancel();
    else if (onConfirm) onConfirm();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={handleDismiss}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.iconContainer}>
            <Icon size={28} color={theme.colors.primary} />
          </View>

          {!!title && (
            <AppText
              variant="h2"
              style={[styles.title, isDanger ? styles.titleDanger : styles.titlePrimary]}
            >
              {title}
            </AppText>
          )}

          {!!message && (
            <AppText variant="body" style={styles.description}>
              {message}
            </AppText>
          )}

          <Pressable
            style={[
              styles.confirmButton,
              isDanger ? styles.confirmDanger : styles.confirmPrimary,
              loading && styles.confirmButtonDisabled,
            ]}
            onPress={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={isDanger ? '#FFFFFF' : theme.colors.midnight[950]}
              />
            ) : (
              <AppText
                variant="button"
                style={[
                  styles.confirmButtonText,
                  isDanger ? styles.confirmTextDanger : styles.confirmTextPrimary,
                ]}
              >
                {confirmLabel}
              </AppText>
            )}
          </Pressable>

          {!!cancelLabel && (
            <Pressable
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={loading}
            >
              <AppText
                variant="button"
                style={[styles.cancelButtonText, loading && styles.buttonTextDisabled]}
              >
                {cancelLabel}
              </AppText>
            </Pressable>
          )}
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
    backgroundColor: theme.colors.background?.main || '#231640',
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
    textAlign: 'center',
    marginBottom: theme.spacing.s8,
  },
  titleDanger: { color: theme.colors.error },
  titlePrimary: { color: theme.colors.primary },
  description: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: theme.spacing.s24,
    opacity: 0.8,
  },
  confirmButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: theme.spacing.s12,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmDanger: { backgroundColor: theme.colors.error },
  confirmPrimary: { backgroundColor: theme.colors.primary },
  confirmTextDanger: { color: '#FFFFFF' },
  confirmTextPrimary: { color: theme.colors.midnight[950] },
  confirmButtonText: {
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
