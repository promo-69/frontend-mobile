import React from 'react';
import { Modal, StyleSheet, View, TouchableOpacity } from 'react-native';
import { theme } from '../constants';
import { AppText } from './AppText';
import { Button } from './ui/Button';

export const LogoutModal = ({ visible, onConfirm, onCancel }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.modalCard}>
        <AppText variant="h2" style={styles.modalTitle}>
          Cerrar Sesión
        </AppText>
        <AppText variant="body" style={styles.modalDesc}>
          ¿Estás seguro de que deseas salir de tu cuenta? Perderás el acceso a tus funciones personalizadas.
        </AppText>
        
        <View style={styles.modalActions}>
          <Button 
            title="SÍ, CERRAR SESIÓN" 
            onPress={onConfirm} 
            style={styles.btnConfirm}
          />
          <TouchableOpacity onPress={onCancel} style={styles.btnCancel}>
            <AppText variant="label" style={styles.btnTextCancel}>
              MANTENER SESIÓN
            </AppText>
          </TouchableOpacity>
        </View>
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
  modalTitle: { color: '#ff4444', textAlign: 'center', marginBottom: theme.spacing.s12 },
  modalDesc: {
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.s24,
    lineHeight: 20,
  },
  modalActions: { gap: theme.spacing.s12 },
  btnConfirm: { backgroundColor: '#ff4444' },
  btnCancel: { padding: theme.spacing.s12, alignItems: 'center' },
  btnTextCancel: { color: theme.colors.textPrimary, opacity: 0.5 },
});