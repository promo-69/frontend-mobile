import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SEAT_SIZE = 35;
const SEAT_MARGIN = 8;
const SCREEN_HEIGHT = 20;

const COLORS = {
  available: '#713182', // Morado intermedio
  selected: '#F6AD38', // Dorado brillante
  occupied: '#4b5563', // Gris oscuro
  textMain: '#FFFFFF',
  textOccupied: '#A0AEC0', // Gris claro para texto de asiento ocupado
  screenGradientStart: '#f4b400',
  screenGradientEnd: 'rgba(244, 180, 0, 0.2)',
};

export default function SeatMap({ seatsData, selectedSeats, onToggleSeat }) {
  // Agrupar y ordenar asientos por fila y columna
  const groupedSeats = useMemo(() => {
    const rowsMap = new Map();
    seatsData.forEach((seat) => {
      if (!rowsMap.has(seat.row)) {
        rowsMap.set(seat.row, []);
      }
      rowsMap.get(seat.row).push(seat);
    });

    // Ordenar columnas dentro de cada fila y luego las filas alfabéticamente
    const sortedRows = Array.from(rowsMap.entries())
      .sort(([rowA], [rowB]) => rowA.localeCompare(rowB))
      .map(([rowName, seatsInRow]) => {
        const sortedSeats = seatsInRow.sort((a, b) => a.column - b.column);
        return { rowName, seats: sortedSeats };
      });

    return sortedRows;
  }, [seatsData]);

  return (
    <View style={styles.container}>
      {/* Representación de la Pantalla */}
      <View style={styles.screenContainer}>
        <LinearGradient
          colors={[COLORS.screenGradientStart, COLORS.screenGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.screenGradient}
        />
        <Text style={styles.screenText}>PANTALLA</Text>
      </View>

      {/* Contenedor de Scroll para el mapa de asientos */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ScrollView
          contentContainerStyle={styles.seatMapContent}
          showsVerticalScrollIndicator={false}
        >
          {groupedSeats.map((row) => (
            <View key={row.rowName} style={styles.row}>
              <Text style={styles.rowLabel}>{row.rowName}</Text>
              {row.seats.map((seat) => {
                const seatId = seat.id ?? seat.seatId ?? seat._id;
                const seatColumn = seat.column ?? seat.number ?? '';

                const isSelected =
                  Array.isArray(selectedSeats) &&
                  selectedSeats.some((s) => s.seatId === seatId);

                // Basado en el nuevo API, los estados pueden ser: 'available', 'sold', 'maintenance', 'locked'
                // Si no viene el estado, asumimos 'available'
                const status = seat.status ?? 'available';
                const isOccupied = status !== 'available';
                const isDisabled = isOccupied;

                return (
                  <TouchableOpacity
                    key={seatId ?? `${row.rowName}-${seatColumn}`}
                    style={[
                      styles.seat,
                      isOccupied && styles.seatOccupied,
                      isSelected && styles.seatSelected,
                      !isOccupied && !isSelected && styles.seatAvailable,
                    ]}
                    onPress={() =>
                      !isDisabled &&
                      onToggleSeat(seatId, {
                        row: seat.row,
                        column: seatColumn,
                        price: seat.price ?? 0,
                      })
                    }
                    disabled={isDisabled}
                    accessibilityLabel={`Asiento ${seat.row}${seatColumn} ${isOccupied ? 'ocupado' : 'disponible'}`}
                    accessibilityState={{
                      disabled: isDisabled,
                      selected: isSelected,
                    }}
                  >
                    <Text
                      style={[
                        styles.seatText,
                        isOccupied && styles.seatTextOccupied,
                      ]}
                    >
                      {seatColumn}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
  },
  screenContainer: {
    alignSelf: 'center',
    width: '80%',
    height: SCREEN_HEIGHT,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    transform: [{ perspective: 100 }, { rotateX: '40deg' }], // Simula la perspectiva de una pantalla
    shadowColor: COLORS.screenGradientStart,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  screenGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  screenText: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    marginTop: -8, // Ajuste para centrar verticalmente
    color: COLORS.textMain,
    fontSize: 12,
    fontWeight: 'bold',
  },
  seatMapContent: {
    paddingHorizontal: 20,
    alignItems: 'flex-start', // Asegura que las filas se alineen a la izquierda
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SEAT_MARGIN,
  },
  rowLabel: {
    width: SEAT_SIZE,
    textAlign: 'center',
    color: COLORS.textGray,
    fontWeight: 'bold',
    marginRight: SEAT_MARGIN,
  },
  seat: {
    width: SEAT_SIZE,
    height: SEAT_SIZE,
    borderRadius: 8,
    marginHorizontal: SEAT_MARGIN / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatAvailable: { backgroundColor: COLORS.available },
  seatSelected: { backgroundColor: COLORS.selected },
  seatOccupied: { backgroundColor: COLORS.occupied },
  seatText: { color: COLORS.textMain, fontWeight: 'bold', fontSize: 14 },
  seatTextOccupied: { color: COLORS.textOccupied },
});
