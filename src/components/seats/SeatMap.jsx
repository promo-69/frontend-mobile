import { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SEAT_SIZE = 30;
const SEAT_GAP = 6;
const LABEL_SIZE = 22;

const COLORS = {
  available: '#713182', // Morado (igual que la leyenda)
  selected: '#F6AD38', // Dorado
  occupied: '#4b5563', // Gris
  label: '#E9E3F5', // Letras/números de ejes: claros y legibles
};

export default function SeatMap({
  seatsData = [],
  selectedSeats = [],
  onToggleSeat,
}) {
  const { groupedSeats, columns } = useMemo(() => {
    const rowsMap = new Map();
    const colSet = new Set();
    (seatsData || []).forEach((seat) => {
      if (!rowsMap.has(seat.row)) rowsMap.set(seat.row, []);
      rowsMap.get(seat.row).push(seat);
      const col = seat.column ?? seat.number;
      if (col != null) colSet.add(col);
    });

    const sortedRows = Array.from(rowsMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([rowName, seatsInRow]) => ({
        rowName,
        seats: seatsInRow.sort((a, b) => a.column - b.column),
      }));

    const sortedCols = Array.from(colSet).sort((a, b) => a - b);
    return { groupedSeats: sortedRows, columns: sortedCols };
  }, [seatsData]);

  return (
    <ScrollView
      style={styles.vScroll}
      contentContainerStyle={styles.vScrollContent}
      showsVerticalScrollIndicator={false}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hScrollContent}
      >
        {/* Header y filas en el mismo contenedor: scrollean juntos y los
            números de columna quedan siempre alineados con los asientos. */}
        <View>
          {/* Encabezado de números de columna */}
          <View style={styles.headerRow}>
            <View style={styles.cornerCell} />
            {columns.map((col) => (
              <View key={`col-${col}`} style={styles.headerCell}>
                <Text style={styles.axisLabel}>{col}</Text>
              </View>
            ))}
          </View>

          {/* Filas de asientos */}
          {groupedSeats.map((row) => (
            <View key={row.rowName} style={styles.row}>
              <View style={styles.rowLabelCell}>
                <Text style={styles.axisLabel}>{row.rowName}</Text>
              </View>
              {row.seats.map((seat) => {
                const seatId = seat.id ?? seat.seatId ?? seat._id;
                const seatColumn = seat.column ?? seat.number ?? '';
                const isSelected =
                  Array.isArray(selectedSeats) &&
                  selectedSeats.some((s) => s.seatId === seatId);
                const status = seat.status ?? 'available';
                const isOccupied = status !== 'available';

                return (
                  <TouchableOpacity
                    key={seatId ?? `${row.rowName}-${seatColumn}`}
                    style={[
                      styles.seat,
                      !isOccupied && !isSelected && styles.seatAvailable,
                      isOccupied && styles.seatOccupied,
                      isSelected && styles.seatSelected,
                    ]}
                    onPress={() =>
                      !isOccupied &&
                      onToggleSeat(seatId, {
                        row: seat.row,
                        column: seatColumn,
                        category: seat.category ?? null,
                        price: seat.price ?? 0,
                      })
                    }
                    disabled={isOccupied}
                    activeOpacity={0.7}
                    accessibilityLabel={`Asiento ${seat.row}${seatColumn} ${isOccupied ? 'ocupado' : 'disponible'}`}
                    accessibilityState={{
                      disabled: isOccupied,
                      selected: isSelected,
                    }}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  vScroll: { flex: 1 },
  vScrollContent: {
    paddingTop: 12,
    paddingBottom: 24,
    flexGrow: 1,
  },
  hScrollContent: {
    paddingHorizontal: 16,
    minWidth: '100%',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SEAT_GAP,
  },
  cornerCell: { width: LABEL_SIZE, marginRight: SEAT_GAP },
  headerCell: {
    width: SEAT_SIZE,
    marginHorizontal: SEAT_GAP / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SEAT_GAP,
  },
  rowLabelCell: {
    width: LABEL_SIZE,
    marginRight: SEAT_GAP,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Etiquetas de ejes (filas y columnas): claras, SIEMPRE legibles
  axisLabel: {
    color: COLORS.label,
    fontWeight: '700',
    fontSize: 12,
  },
  seat: {
    width: SEAT_SIZE,
    height: SEAT_SIZE,
    borderRadius: 6,
    marginHorizontal: SEAT_GAP / 2,
  },
  seatAvailable: { backgroundColor: COLORS.available },
  seatSelected: { backgroundColor: COLORS.selected },
  seatOccupied: { backgroundColor: COLORS.occupied },
});
