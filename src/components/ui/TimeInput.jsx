import { Clock } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
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

const { colors, spacing, borderRadius } = theme;

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

const pad = (n) => String(n).padStart(2, '0');

// 'HH:MM' (24h) → { hour12, minute, meridiem } o null
const parse24 = (value) => {
  if (!/^\d{2}:\d{2}$/.test(value || '')) return null;
  const [h, m] = value.split(':').map(Number);
  if (h > 23 || m > 59) return null;
  const meridiem = h >= 12 ? 'pm' : 'am';
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, minute: m, meridiem };
};

// { hour12, minute, meridiem } → 'HH:MM' (24h)
const to24 = ({ hour12, minute, meridiem }) => {
  let h = hour12 % 12;
  if (meridiem === 'pm') h += 12;
  return `${pad(h)}:${pad(minute)}`;
};

// 'HH:MM' (24h) → '04:27 p. m.' para mostrar
const toDisplay = (value) => {
  const parsed = parse24(value);
  if (!parsed) return '';
  const suffix = parsed.meridiem === 'pm' ? 'p. m.' : 'a. m.';
  return `${pad(parsed.hour12)}:${pad(parsed.minute)} ${suffix}`;
};

// ─── Columna desplazable (horas o minutos) ───────────────────────────────────
function WheelColumn({ data, selected, onSelect }) {
  const scrollRef = useRef(null);

  // Centrar el valor seleccionado al abrir
  useEffect(() => {
    const index = data.indexOf(selected);
    if (index >= 0 && scrollRef.current) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, index * ITEM_HEIGHT - ITEM_HEIGHT * 2),
          animated: false,
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []); // solo al montar

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.wheel}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
    >
      {data.map((item) => {
        const active = item === selected;
        return (
          <TouchableOpacity
            key={item}
            style={[styles.wheelItem, active && styles.wheelItemActive]}
            onPress={() => onSelect(item)}
            activeOpacity={0.7}
          >
            <AppText
              style={[styles.wheelText, active && styles.wheelTextActive]}
            >
              {pad(item)}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

/**
 * Selector de hora con columnas de horas / minutos / a. m.-p. m.
 *
 * @param {string} value    Hora en formato 24h 'HH:MM' (ej. '16:27').
 * @param {func}   onChange Recibe la nueva hora en formato 24h 'HH:MM'.
 * @param {string} title    Título del modal (ej. 'Hora inicio').
 * @param {number} minuteStep Paso de minutos (1 por defecto).
 * @param {func}   renderTrigger (open, displayValue) => ReactNode. Trigger personalizado.
 */
export const TimeInput = ({
  value,
  onChange,
  title = 'Selecciona la hora',
  placeholder = '--:-- -- --',
  minuteStep = 1,
  renderTrigger,
}) => {
  const [show, setShow] = useState(false);
  const [temp, setTemp] = useState(
    () => parse24(value) || { hour12: 12, minute: 0, meridiem: 'pm' }
  );

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutes = useMemo(
    () => Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep),
    [minuteStep]
  );

  const displayValue = toDisplay(value);

  const open = () => {
    setTemp(parse24(value) || { hour12: 12, minute: 0, meridiem: 'pm' });
    setShow(true);
  };

  const confirm = () => {
    onChange(to24(temp));
    setShow(false);
  };

  return (
    <>
      {renderTrigger ? (
        renderTrigger(open, displayValue)
      ) : (
        <TouchableOpacity
          style={styles.trigger}
          onPress={open}
          activeOpacity={0.8}
        >
          <Clock size={16} color={colors.textSecondary} />
          <AppText
            style={[styles.triggerText, !displayValue && styles.triggerPlaceholder]}
          >
            {displayValue || placeholder}
          </AppText>
        </TouchableOpacity>
      )}

      <Modal
        visible={show}
        transparent
        animationType="fade"
        onRequestClose={() => setShow(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShow(false)}>
          <Pressable style={styles.card} onPress={() => {}}>
            <AppText style={styles.title}>{title}</AppText>

            {/* Vista previa de la selección */}
            <AppText style={styles.preview}>
              {pad(temp.hour12)}:{pad(temp.minute)}{' '}
              {temp.meridiem === 'pm' ? 'p. m.' : 'a. m.'}
            </AppText>

            <View style={styles.columns}>
              {/* Horas */}
              <View style={styles.columnWrap}>
                <AppText style={styles.columnLabel}>Hora</AppText>
                <WheelColumn
                  data={hours}
                  selected={temp.hour12}
                  onSelect={(hour12) => setTemp((t) => ({ ...t, hour12 }))}
                />
              </View>

              {/* Minutos */}
              <View style={styles.columnWrap}>
                <AppText style={styles.columnLabel}>Min</AppText>
                <WheelColumn
                  data={minutes}
                  selected={temp.minute}
                  onSelect={(minute) => setTemp((t) => ({ ...t, minute }))}
                />
              </View>

              {/* Meridiano */}
              <View style={[styles.columnWrap, styles.meridiemWrap]}>
                <AppText style={styles.columnLabel}> </AppText>
                {[
                  { id: 'am', label: 'a. m.' },
                  { id: 'pm', label: 'p. m.' },
                ].map((opt) => {
                  const active = temp.meridiem === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.meridiemBtn,
                        active && styles.meridiemBtnActive,
                      ]}
                      onPress={() =>
                        setTemp((t) => ({ ...t, meridiem: opt.id }))
                      }
                      activeOpacity={0.7}
                    >
                      <AppText
                        style={[
                          styles.meridiemText,
                          active && styles.meridiemTextActive,
                        ]}
                      >
                        {opt.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Acciones */}
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => setShow(false)} hitSlop={8}>
                <AppText style={styles.cancelText}>CANCELAR</AppText>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirm} hitSlop={8}>
                <AppText style={styles.acceptText}>ACEPTAR</AppText>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s8,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    borderRadius: borderRadius.s8,
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s12,
  },
  triggerText: { flex: 1, color: colors.textPrimary, fontSize: 14 },
  triggerPlaceholder: { color: colors.textDisabled },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.s24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.midnight[900],
    borderRadius: borderRadius.s24,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    padding: spacing.s16,
  },
  title: {
    color: colors.primary,
    fontSize: 16,
    fontFamily: theme.typography.family.primary.bold,
    marginBottom: spacing.s4,
    textAlign: 'center',
  },
  preview: {
    color: colors.textPrimary,
    fontSize: 22,
    fontFamily: theme.typography.family.primary.bold,
    textAlign: 'center',
    marginBottom: spacing.s12,
  },
  columns: {
    flexDirection: 'row',
    gap: spacing.s8,
  },
  columnWrap: { flex: 1 },
  columnLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: theme.typography.family.primary.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: spacing.s4,
  },
  wheel: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    backgroundColor: colors.midnight[800],
    borderRadius: borderRadius.s8,
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelItemActive: { backgroundColor: colors.primary },
  wheelText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: theme.typography.family.primary.regular,
  },
  wheelTextActive: {
    color: colors.midnight[950],
    fontFamily: theme.typography.family.primary.bold,
  },
  meridiemWrap: { maxWidth: 88 },
  meridiemBtn: {
    paddingVertical: spacing.s12,
    marginBottom: spacing.s8,
    borderRadius: borderRadius.s8,
    alignItems: 'center',
    backgroundColor: colors.midnight[800],
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  meridiemBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  meridiemText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: theme.typography.family.primary.medium,
  },
  meridiemTextActive: {
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
});
