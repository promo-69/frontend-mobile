import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { LogOut } from 'lucide-react-native'; 
//import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export const LogoutModal = ({ visible, onClose, onConfirm }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Fondo oscuro traslúcido (Cierra el modal si se toca afuera) */}
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        {/* Opcional: Si quieres blur real en iOS/Android usando Expo, envuelve el contenido en un BlurView */}
        {/* <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}> */}
        
        {/* Contenedor del Modal (Evita que el click adentro cierre el modal) */}
        <TouchableOpacity 
          activeOpacity={1} 
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Ícono dinámico estilo web (Círculo naranja #D9982F) */}
          <View style={styles.iconCircle}>
            <LogOut size={32} color="#231640" />
          </View>

          {/* Mensajes */}
          <Text style={styles.title}>¿Cerrar Sesión?</Text>
          <Text style={styles.subtitle}>
            ¿Estás seguro de que deseas salir de tu cuenta de Cineflix?
          </Text>

          {/* Grupo de Botones */}
          <View style={styles.buttonGroup}>
            {/* Botón de Confirmar (Naranja con texto oscuro) */}
            <TouchableOpacity 
              style={[styles.button, styles.btnConfirm]} 
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={[styles.btnText, styles.textConfirm]}>CERRAR SESIÓN</Text>
            </TouchableOpacity>

            {/* Botón de Cancelar (Transparente con borde/texto sutil) */}
            <TouchableOpacity 
              style={[styles.button, styles.btnCancel]} 
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={[styles.btnText, styles.textCancel]}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* </BlurView> */}
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // fixed inset-0 bg-black/50 flex items-center justify-center
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // bg-[#231640] p-10 rounded-xl border border-[#7B1A82] shadow-2xl
  modalContainer: {
    backgroundColor: '#231640',
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#7B1A82',
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.85, // max-w-sm adaptado a pantallas móviles
    maxWidth: 360,
    // Sombra equivalente a shadow-2xl
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.58,
    shadowRadius: 16.00,
    elevation: 24,
  },
  // w-16 h-16 rounded-full bg-[#D9982F] mb-6 shadow-lg
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D9982F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  // text-white text-2xl font-bold text-center
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  buttonGroup: {
    width: '100%',
    marginTop: 16,
    gap: 12, // Espaciado vertical entre los dos botones
  },
  // mt-8 w-full font-bold rounded-full py-2 uppercase
  button: {
    width: '100%',
    borderRadius: 100, // rounded-full
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnConfirm: {
    backgroundColor: '#D9982F', // bg-[#D9982F]
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  btnCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  btnText: {
    fontSize: 13, // text-[13px]
    fontWeight: 'bold', // font-bold
    letterSpacing: 0.5,
  },
  textConfirm: {
    color: '#231640', // text-[#231640]
  },
  textCancel: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});