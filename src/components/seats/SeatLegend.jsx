import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const COLORS = {
  available: '#713182', // Morado intermedio
  selected: '#F6AD38', // Dorado brillante
  occupied: '#4b5563', // Gris oscuro
  textMain: '#FFFFFF',
  textGray: '#B0A8C5',
};

export default function SeatLegend() {
  const legendItems = [
    { label: 'Disponible', color: COLORS.available },
    { label: 'Seleccionado', color: COLORS.selected },
    { label: 'Ocupado', color: COLORS.occupied },
  ];

  return (
    <View style={styles.container}>
      {legendItems.map((item, index) => (
        <View key={index} style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: item.color }]} />
          <Text style={styles.labelText}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.2)', // Fondo sutil para la leyenda
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 10,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  colorBox: { width: 16, height: 16, borderRadius: 4, marginRight: 8 },
  labelText: { fontSize: 12, color: COLORS.textGray },
});