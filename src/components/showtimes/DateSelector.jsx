import { useMemo } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { generateNextDays } from '../../utils/dateUtils';

export default function DateSelector({ selectedDate, onSelectDate, weekdays }) {
  
 
  
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {weekdays.map((item) => {
          // Evaluar si esta tarjeta específica es la que el usuario presionó
          const isActive = selectedDate === item.fullDate;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => onSelectDate(item.fullDate)}
              style={[
                styles.dateCard,
                isActive ? styles.cardActive : styles.cardInactive,
              ]}
            >
              {/* Parte superior */}
            <Text
              style={[
                styles.dayLabel,
                isActive ? styles.textActive : styles.textInactive,
              ]}
            >
              {item.day?.toUpperCase()}
            </Text>

              {/* Parte del medio: El mes dinámico */}
             <Text style={[styles.monthLabel, isActive && styles.monthActive]}>
                {item.month || 'JUN'}
              </Text>

              {/* Parte inferior: El número del día (11, 12, 13...) */}
              <Text
                style={[
                  styles.dayNumber,
                  isActive ? styles.numberActive : styles.numberInactive,
                ]}
              >
                {item.date}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  scrollContainer: {
    paddingHorizontal: 16, 
    gap: 12, 
  },
  dateCard: {
    width: 70,
    height: 95,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  // ESTADO SELECCIONADO (Identidad Cineflix)
  cardActive: {
    backgroundColor: '#7B1A82', // Púrpura encendido corporativo
    borderColor: 'rgba(255, 255, 255, 0.25)',
    elevation: 4, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  // ESTADO INACTIVO
  cardInactive: {
    backgroundColor: 'rgba(35, 22, 64, 0.4)', // Púrpura oscuro transclúcido (#231640)
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  textActive: {
    color: '#F6AD38', // Dorado corporativo
  },
  textInactive: {
    color: '#B0A8C5', // Gris lavanda apagado
  },
  monthLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    marginVertical: 2,
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  numberActive: {
    color: '#FFFFFF',
  },
  numberInactive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});