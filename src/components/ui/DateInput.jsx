import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../../constants';
import { AppText } from './AppText';
import { Input } from './Input';

const { colors, spacing, borderRadius } = theme;

const WEEKDAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

// Fecha local (sin zona horaria) → 'YYYY-MM-DD'
const toYMD = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// 'YYYY-MM-DD' → Date local (o null)
const parseYMD = (s) => {
  if (!s || !s.includes('-')) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const sameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfDay = (d) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const DateInput = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  maximumDate = new Date(),
  minimumYear = 1920,
}) => {
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState('days'); // 'days' | 'years'
  const [viewDate, setViewDate] = useState(() => parseYMD(value) || new Date());
  const [temp, setTemp] = useState(() => parseYMD(value));

  const maxDay = useMemo(() => startOfDay(maximumDate), [maximumDate]);

  const displayValue =
    value && value.includes('-')
      ? value.split('-').reverse().join('/')
      : value || '';

  const open = () => {
    const base = parseYMD(value) || new Date();
    setViewDate(base);
    setTemp(parseYMD(value));
    setMode('days');
    setShow(true);
  };

  const goMonth = (delta) => {
    setViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    );
  };

  const pickYear = (year) => {
    setViewDate((prev) => new Date(year, prev.getMonth(), 1));
    setMode('days');
  };

  const confirm = () => {
    if (temp) onChange(toYMD(temp));
    setShow(false);
  };

  // Celdas del mes visible
  const cells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay(); // 0=Dom
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < firstWeekday; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(year, month, d));
    return arr;
  }, [viewDate]);

  const years = useMemo(() => {
    const max = maxDay.getFullYear();
    const list = [];
    for (let y = max; y >= minimumYear; y--) list.push(y);
    return list;
  }, [maxDay, minimumYear]);

  const today = startOfDay(new Date());

  return (
    <>
      <Pressable onPress={open} style={{ width: '100%' }}>
        <View pointerEvents="none">
          <Input
            label={label}
            value={displayValue}
            placeholder={placeholder}
            editable={false}
            error={error}
            rightIcon={<CalendarIcon size={20} color={colors.secondary} />}
          />
        </View>
      </Pressable>

      <Modal visible={show} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShow(false)}>
          <Pressable style={styles.card} onPress={() => {}}>
            {/* Encabezado: mes/año (tap → selector de año) + flechas */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => goMonth(-1)}
                hitSlop={8}
                disabled={mode === 'years'}
                style={styles.navBtn}
              >
                <ChevronLeft
                  size={22}
                  color={mode === 'years' ? 'transparent' : colors.textPrimary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMode(mode === 'years' ? 'days' : 'years')}
                activeOpacity={0.7}
                style={styles.titleWrap}
              >
                <AppText style={styles.title}>
                  {mode === 'years'
                    ? 'Elige el año'
                    : `${MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}`}
                </AppText>
                <ChevronRight
                  size={16}
                  color={colors.primary}
                  style={{
                    transform: [{ rotate: mode === 'years' ? '-90deg' : '90deg' }],
                  }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => goMonth(1)}
                hitSlop={8}
                disabled={mode === 'years'}
                style={styles.navBtn}
              >
                <ChevronRight
                  size={22}
                  color={mode === 'years' ? 'transparent' : colors.textPrimary}
                />
              </TouchableOpacity>
            </View>

            {mode === 'days' ? (
              <>
                {/* Días de la semana */}
                <View style={styles.weekRow}>
                  {WEEKDAYS.map((w, i) => (
                    <View key={i} style={styles.cell}>
                      <AppText style={styles.weekday}>{w}</AppText>
                    </View>
                  ))}
                </View>

                {/* Grilla de días */}
                <View style={styles.grid}>
                  {cells.map((date, i) => {
                    if (!date) return <View key={i} style={styles.cell} />;
                    const disabled = date > maxDay;
                    const selected = sameDay(date, temp);
                    const isToday = sameDay(date, today);
                    return (
                      <TouchableOpacity
                        key={i}
                        style={styles.cell}
                        disabled={disabled}
                        activeOpacity={0.7}
                        onPress={() => setTemp(date)}
                      >
                        <View
                          style={[
                            styles.dayCircle,
                            selected && styles.dayCircleSelected,
                            isToday && !selected && styles.dayCircleToday,
                          ]}
                        >
                          <AppText
                            style={[
                              styles.dayText,
                              disabled && styles.dayTextDisabled,
                              selected && styles.dayTextSelected,
                            ]}
                          >
                            {date.getDate()}
                          </AppText>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : (
              /* Selector de año */
              <ScrollView style={styles.yearScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.yearGrid}>
                  {years.map((y) => {
                    const active = y === viewDate.getFullYear();
                    return (
                      <TouchableOpacity
                        key={y}
                        style={[styles.yearItem, active && styles.yearItemActive]}
                        onPress={() => pickYear(y)}
                        activeOpacity={0.7}
                      >
                        <AppText
                          style={[styles.yearText, active && styles.yearTextActive]}
                        >
                          {y}
                        </AppText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            )}

            {/* Acciones */}
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => setShow(false)} hitSlop={8}>
                <AppText style={styles.cancelText}>CANCELAR</AppText>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirm} hitSlop={8} disabled={!temp}>
                <AppText style={[styles.acceptText, !temp && styles.acceptDisabled]}>
                  ACEPTAR
                </AppText>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const CELL = `${100 / 7}%`;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.s24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.midnight[900],
    borderRadius: borderRadius.s24,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    padding: spacing.s16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.s12,
  },
  navBtn: { padding: spacing.s4 },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s4,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: colors.primary,
    fontSize: 16,
    fontFamily: theme.typography.family.primary.bold,
    textTransform: 'capitalize',
  },
  weekRow: { flexDirection: 'row', marginBottom: spacing.s4 },
  weekday: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: theme.typography.family.primary.bold,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: CELL,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: { backgroundColor: colors.primary },
  dayCircleToday: {
    borderWidth: 1.5,
    borderColor: colors.midnight[600],
  },
  dayText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: theme.typography.family.primary.regular,
  },
  dayTextSelected: {
    color: colors.midnight[950],
    fontFamily: theme.typography.family.primary.bold,
  },
  dayTextDisabled: { color: colors.textDisabled, opacity: 0.4 },
  yearScroll: { maxHeight: 280 },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  yearItem: {
    width: '31%',
    paddingVertical: spacing.s12,
    marginBottom: spacing.s8,
    borderRadius: borderRadius.s8,
    alignItems: 'center',
    backgroundColor: colors.midnight[800],
  },
  yearItemActive: { backgroundColor: colors.primary },
  yearText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: theme.typography.family.primary.medium,
  },
  yearTextActive: {
    color: colors.midnight[950],
    fontFamily: theme.typography.family.primary.bold,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.s24,
    marginTop: spacing.s16,
    paddingTop: spacing.s8,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: theme.typography.family.primary.bold,
  },
  acceptText: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: theme.typography.family.primary.bold,
  },
  acceptDisabled: { color: colors.textDisabled, opacity: 0.5 },
});
