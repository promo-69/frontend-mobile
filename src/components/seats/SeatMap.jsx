import { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../../constants';

const SEAT_SIZE = 30;
const SEAT_GAP = 6;
const LABEL_SIZE = 22;

// Colores específicos del mapa de asientos (no son tokens generales del tema)
const SEAT_COLORS = {
  available: '#713182',
  selected: '#F6AD38',
  occupied: '#4b5563',
  label: '#E9E3F5',
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
          {groupedSeats.map((row) => {
            // Mapa columna → asiento para respetar los pasillos (columnas sin
            // asiento en esta fila) y mantener la alineación con el encabezado.
            const seatByCol = new Map(
              row.seats.map((s) => [s.column ?? s.number, s])
            );
            return (
              <View key={row.rowName} style={styles.row}>
                <View style={styles.rowLabelCell}>
                  <Text style={styles.axisLabel}>{row.rowName}</Text>
                </View>
                {columns.map((col) => {
                  const seat = seatByCol.get(col);

                  // Pasillo: hueco punteado, no interactivo (como en la web)
                  if (!seat) {
                    return (
                      <View
                        key={`aisle-${row.rowName}-${col}`}
                        style={[styles.seat, styles.aisle]}
                      />
                    );
                  }

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
                    >
                      <Text
                        style={[
                          styles.seatLabel,
                          isSelected && styles.seatLabelSelected,
                          isOccupied && styles.seatLabelOccupied,
                        ]}
                        numberOfLines={1}
                      >
                        {`${row.rowName}${seatColumn}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
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
  axisLabel: {
    color: SEAT_COLORS.label,
    fontWeight: '700',
    fontSize: 12,
  },
  seat: {
    width: SEAT_SIZE,
    height: SEAT_SIZE,
    borderRadius: 6,
    marginHorizontal: SEAT_GAP / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatAvailable: { backgroundColor: SEAT_COLORS.available },
  seatSelected: { backgroundColor: SEAT_COLORS.selected },
  seatOccupied: { backgroundColor: SEAT_COLORS.occupied },
  // Pasillo: hueco punteado semitransparente, claramente distinto de "ocupado"
  aisle: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(233,227,245,0.25)',
  },
  seatLabel: {
    color: SEAT_COLORS.label,
    fontSize: 9,
    fontWeight: '700',
  },
  seatLabelSelected: { color: '#3a2500' },
  seatLabelOccupied: { color: 'rgba(233,227,245,0.45)' },
});
