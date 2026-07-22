import { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { AppText } from '../ui/AppText';
import { theme } from '../../constants';
import { validatePassword } from '../../utils/validators';

export function PasswordVerifyModal({ visible, onConfirm, onCancel, loading }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [formatError, setFormatError] = useState(null);

  const handleConfirm = async () => {
    if (!password.trim() || loading) return;

    const validation = validatePassword(password);
    if (validation !== true) {
      setFormatError(validation);
      return;
    }

    setFormatError(null);
    try {
      await onConfirm(password);
    } catch {
      setError(true);
    }
  };

  const handleClose = () => {
    setPassword('');
    setShowPassword(false);
    setError(false);
    setFormatError(null);
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <AppText variant="h2" style={styles.title}>
            Confirmar Edición
          </AppText>
          <AppText variant="body" style={styles.description}>
            Por seguridad, ingresa tu contraseña actual para continuar.
          </AppText>

          <View style={styles.inputContainer}>
            <AppText variant="small" style={styles.inputLabel}>
              Contraseña
            </AppText>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError(false);
                  if (formatError) setFormatError(null);
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
                placeholder="Contraseña"
                placeholderTextColor="rgba(255,255,255,0.2)"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                accessibilityLabel={
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
              >
                {showPassword ? (
                  <EyeOff size={18} color={theme.colors.textSecondary} />
                ) : (
                  <Eye size={18} color={theme.colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            <View style={[styles.underline, error && styles.underlineError]} />
          </View>

          <View style={styles.errorContainer}>
            {(error || formatError) && (
              <AppText variant="small" style={styles.errorText}>
                {formatError || 'La contraseña es inválida'}
              </AppText>
            )}
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, (loading || !password.trim()) && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={loading || !password.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.background.main} />
            ) : (
              <AppText variant="button" style={styles.confirmButtonText}>
                Validar
              </AppText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
            disabled={loading}
          >
            <AppText variant="button" style={styles.cancelButtonText}>
              Cancelar
            </AppText>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

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
  title: {
    color: theme.colors.primary,
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
  inputContainer: {
    marginBottom: theme.spacing.s4,
  },
  inputLabel: {
    color: theme.colors.textSecondary,
    opacity: 0.5,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 15,
    paddingVertical: 6,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  underline: {
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  underlineError: {
    backgroundColor: theme.colors.error || '#ef4444',
  },
  errorContainer: {
    minHeight: 24,
    marginBottom: theme.spacing.s8,
  },
  errorText: {
    color: theme.colors.error || '#ef4444',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: theme.spacing.s12,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: theme.colors.background.main || '#231640',
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
});
