import { Modal, StyleSheet, View } from 'react-native';
import { theme } from '../../constants';
import { AppText } from './AppText';
import { CustomButton } from './CustomButton';

export const SuccessModal = ({ visible, onClose }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.modalCard}>
        <AppText
          variant="h2"
          style={[styles.modalTitle, { color: theme.colors.primary }]}
        >
          ¡Perfil Actualizado!
        </AppText>
        <AppText variant="body" style={styles.modalDesc}>
          Tus cambios se han guardado con éxito en el sistema.
        </AppText>
        <CustomButton title="ENTENDIDO" onPress={onClose} />
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: theme.colors.surface || '#231640',
    width: '88%',
    borderRadius: 28,
    padding: theme.spacing.s32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: { textAlign: 'center', marginBottom: theme.spacing.s12 },
  modalDesc: {
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.s24,
  },
});
