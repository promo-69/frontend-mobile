import { Controller, useForm } from 'react-hook-form';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { theme } from '.././constants';
import { validatePassword } from '../utils/validators';
import { AppText } from './AppText';
import { CustomButton } from './ui/CustomButton';
import { Input } from './ui/Input';

export const EditModal = ({ visible, onConfirm, onCancel, isLoading }) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: { password: '' }
  });

  const handleConfirm = (data) => {
    onConfirm(data.password);
    reset();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <AppText variant="h2" style={styles.modalTitle}>Confirmar Cambios</AppText>
          <AppText variant="body" style={styles.modalDesc}>
            Para guardar los cambios, por favor ingresa tu contraseña actual.
          </AppText>
          
          <Controller
            control={control}
            name="password"
            rules={{ required: 'Se requiere la contraseña para autorizar', validate: validatePassword }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input
                label="Tu contraseña"
                secureTextEntry
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={error?.message}
              />
            )}
          />

          <View style={styles.modalActions}>
            <CustomButton 
              title="VALIDAR Y GUARDAR" 
              onPress={handleSubmit(handleConfirm)} 
              loading={isLoading}
            />
            <TouchableOpacity onPress={onCancel} style={styles.btnCancel}>
              <AppText variant="label" style={styles.btnTextCancel}>CANCELAR</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: theme.colors.surface || '#231640', width: '88%', borderRadius: 28, padding: theme.spacing.s32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalTitle: { color: theme.colors.primary, textAlign: 'center', marginBottom: theme.spacing.s12 },
  modalDesc: { color: theme.colors.textPrimary, textAlign: 'center', marginBottom: theme.spacing.s24, lineHeight: 20 },
  modalActions: { marginTop: theme.spacing.s24, gap: theme.spacing.s12 },
  btnCancel: { padding: theme.spacing.s12, alignItems: 'center' },
  btnTextCancel: { color: theme.colors.textPrimary, opacity: 0.5 }
});