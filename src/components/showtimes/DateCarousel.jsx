import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';

export default function DateCarousel({ selectedDate, onSelectDate, weekdays }) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {weekdays.map((item) => {
          const isActive = selectedDate === item.fullDate;

          return (
            <TouchableOpacity
              key={item.fullDate}
              activeOpacity={item.disabled ? 1 : 0.7}
              disabled={item.disabled} // Bloquea la acción si el backend no tiene horarios para este día
              onPress={() => onSelectDate(item.fullDate)}
              style={[
                styles.dateCard,
                isActive ? styles.cardActive : styles.cardInactive,
                item.disabled && styles.cardDisabled, // Opacidad baja si no hay funciones
              ]}
            >
              <Text
                style={[
                  styles.dayLabel,
                  isActive ? styles.textActive : styles.textInactive,
                  item.disabled && styles.textDisabled,
                ]}
              >
                {item.day?.toUpperCase()}
              </Text>

              <Text
                style={[
                  styles.monthLabel,
                  isActive && styles.monthActive,
                  item.disabled && styles.textDisabled,
                ]}
              >
                {item.month || 'JUN'}
              </Text>

              <Text
                style={[
                  styles.dayNumber,
                  isActive ? styles.numberActive : styles.numberInactive,
                  item.disabled && styles.textDisabled,
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
  container: { marginVertical: 16 },
  scrollContainer: { paddingHorizontal: 4, gap: 12 },
  dateCard: {
    width: 70,
    height: 95,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cardActive: {
    backgroundColor: '#7B1A82',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardInactive: {
    backgroundColor: 'rgba(35, 22, 64, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardDisabled: {
    opacity: 0.25,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderColor: 'transparent',
  },
  dayLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  textActive: { color: '#f4b400' },
  textInactive: { color: '#B0A8C5' },
  monthLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    marginVertical: 2,
    textTransform: 'uppercase',
  },
  monthActive: { color: '#FFFFFF' },
  dayNumber: { fontSize: 24, fontWeight: 'bold' },
  numberActive: { color: '#FFFFFF' },
  numberInactive: { color: 'rgba(255, 255, 255, 0.8)' },
  textDisabled: { color: 'rgba(255, 255, 255, 0.3)' },
});
