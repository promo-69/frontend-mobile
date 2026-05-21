import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { AppText } from '../AppText';

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
        <ChevronLeft size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Título de la pantalla */}
      <View style={styles.titleContainer}>
        {title && 
        <AppText style={styles.headerTitle}>
            {title}
        </AppText>}
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
    backgroundColor: '#442F6B', 
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rightContainer: {
    alignItems: 'flex-end',
  }
});