import { useRouter } from 'expo-router';
import {
    ArrowLeft,
    Calendar,
    ChevronDown,
    Info,
    MapPin,
    Users,
} from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { AppText } from '../../../components/ui/AppText';
import { DateInput } from '../../../components/ui/DateInput';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { TimeInput } from '../../../components/ui/TimeInput';
import { theme } from '../../../constants';
import {
    createRoomRentalRequest,
    getCinemasList,
    getEventTypes,
    getRoomsByCinema,
} from '../../../services/info.service';

const { colors, spacing, borderRadius } = theme;

// Anticipación mínima requerida (2 semanas = 14 días)
const MIN_DAYS_AHEAD = 14;

// Límites del calendario: desde hoy + 14 días hasta 1 año adelante
const getDateBounds = () => {
  const min = new Date();
  min.setHours(0, 0, 0, 0);
  min.setDate(min.getDate() + MIN_DAYS_AHEAD);
  const max = new Date(min);
  max.setFullYear(max.getFullYear() + 1);
  return { min, max };
};

// ─── Selector reutilizable (abre un modal con opciones) ──────────────────────
function SelectField({
  label,
  placeholder,
  value,
  options,
  onSelect,
  disabled,
  icon: Icon,
  loading,
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <View style={styles.fieldWrapper}>
      <AppText style={styles.fieldLabel}>{label}</AppText>
      <TouchableOpacity
        style={[styles.selectBox, disabled && styles.selectBoxDisabled]}
        onPress={() => !disabled && !loading && setOpen(true)}
        activeOpacity={0.8}
      >
        {Icon ? <Icon size={16} color={colors.textSecondary} /> : null}
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <AppText
            style={[styles.selectText, !selected && styles.selectPlaceholder]}
            numberOfLines={1}
          >
            {selected ? selected.label : placeholder}
          </AppText>
        )}
        <ChevronDown size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.modalCard}>
            <AppText style={styles.modalTitle}>{label}</AppText>
            <ScrollView style={{ maxHeight: 320 }}>
              {options.length === 0 ? (
                <AppText style={styles.modalEmpty}>
                  No hay opciones disponibles.
                </AppText>
              ) : (
                options.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.modalOption,
                      opt.id === value && styles.modalOptionActive,
                    ]}
                    onPress={() => {
                      onSelect(opt.id);
                      setOpen(false);
                    }}
                  >
                    <AppText
                      style={[
                        styles.modalOptionText,
                        opt.id === value && styles.modalOptionTextActive,
                      ]}
                    >
                      {opt.label}
                    </AppText>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Pantalla principal ──────────────────────────────────────────────────────
export default function RentalRequestScreen() {
  const router = useRouter();

  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Campos del formulario
  const [cinemaId, setCinemaId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [eventType, setEventType] = useState(null);
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState(''); // YYYY-MM-DD
  const [startTime, setStartTime] = useState(''); // HH:MM
  const [endTime, setEndTime] = useState(''); // HH:MM
  const [attendees, setAttendees] = useState('');

  // Rango de fechas seleccionables en el calendario
  const dateBounds = useMemo(() => getDateBounds(), []);

  // Carga inicial de catálogos (cines y tipos de evento)
  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingCatalogs(true);
      try {
        const [cinemasData, typesData] = await Promise.all([
          getCinemasList().catch(() => []),
          getEventTypes().catch(() => []),
        ]);
        if (!active) return;
        setCinemas(
          (cinemasData || []).map((c) => ({
            id: c.id,
            label: c.name ?? c.description ?? `Sucursal ${c.id}`,
          }))
        );
        setEventTypes(
          (typesData || []).map((t) => ({
            id: t.id,
            label: t.description ?? t.name ?? `Tipo ${t.id}`,
          }))
        );
      } finally {
        if (active) setLoadingCatalogs(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Cuando cambia la sucursal, cargamos sus salas
  const handleCinemaChange = useCallback(async (id) => {
    setCinemaId(id);
    setRoomId(null);
    setRooms([]);
    setLoadingRooms(true);
    try {
      const roomsData = await getRoomsByCinema(id);
      setRooms(
        (roomsData || []).map((r) => ({
          id: r.id,
          label: r.name ?? `Sala ${r.id}`,
        }))
      );
    } catch {
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  // Validación de fecha (YYYY-MM-DD) y mínimo de anticipación
  const validateDate = (dateStr) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr))
      return 'Usa el formato AAAA-MM-DD.';
    const date = new Date(`${dateStr}T00:00:00`);
    if (isNaN(date.getTime())) return 'La fecha no es válida.';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + MIN_DAYS_AHEAD);
    if (date < minDate)
      return `La solicitud requiere mínimo ${MIN_DAYS_AHEAD} días (2 semanas) de anticipación.`;
    return null;
  };

  const validateTime = (timeStr) => /^\d{2}:\d{2}$/.test(timeStr);

  const handleSubmit = async () => {
    // Validaciones
    if (!cinemaId) return alertMsg('Selecciona una sucursal.');
    if (!roomId) return alertMsg('Selecciona una sala.');
    if (!eventType) return alertMsg('Selecciona la categoría del evento.');
    if (!eventName.trim()) return alertMsg('Ingresa el nombre del evento.');
    if (!eventDescription.trim())
      return alertMsg('Describe los detalles y requerimientos del evento.');

    const dateError = validateDate(eventDate);
    if (dateError) return alertMsg(dateError);

    if (!validateTime(startTime))
      return alertMsg('Ingresa una hora de inicio válida (HH:MM).');
    if (!validateTime(endTime))
      return alertMsg('Ingresa una hora de fin válida (HH:MM).');

    // Construimos los datetime ISO combinando fecha + hora
    const startISO = new Date(`${eventDate}T${startTime}:00`).toISOString();
    const endISO = new Date(`${eventDate}T${endTime}:00`).toISOString();
    if (new Date(endISO) <= new Date(startISO))
      return alertMsg('La hora de fin debe ser posterior a la de inicio.');

    const numAttendees = Number(attendees) || 0;
    if (numAttendees <= 0) return alertMsg('Indica el número de asistentes.');

    const payload = {
      room: roomId,
      event_type: eventType,
      event_name: eventName.trim(),
      event_description: eventDescription.trim(),
      event_date: eventDate,
      requested_start_time: startISO,
      requested_end_time: endISO,
      attendees: numAttendees,
    };

    setSubmitting(true);
    try {
      await createRoomRentalRequest(payload);
      setSubmitting(false);
      // Mensaje de éxito y volver
      alertSuccess();
    } catch (err) {
      setSubmitting(false);
      alertMsg(
        err?.response?.data?.message ||
          'No se pudo enviar la solicitud. Intenta de nuevo.'
      );
    }
  };

  // Helpers de alerta (importados de forma diferida para mantener el componente limpio)
  const [alert, setAlert] = useState(null);
  const alertMsg = (message) => setAlert({ type: 'error', message });
  const alertSuccess = () =>
    setAlert({
      type: 'success',
      message:
        'Tu solicitud de alquiler fue enviada a revisión. Te notificaremos cuando sea aprobada.',
    });

  return (
    <ScreenWrapper>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color={colors.primary} strokeWidth={2.5} />
        </TouchableOpacity>
        <AppText style={styles.topBarTitle}>Alquiler de Sala</AppText>
        <View style={{ width: 26 }} />
      </View>

      {loadingCatalogs ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AppText style={styles.intro}>
            Organiza tus eventos privados con la mejor tecnología
            cinematográfica. Planifica tu evento perfecto en nuestras
            instalaciones.
          </AppText>

          <View style={styles.row}>
            <View style={styles.col}>
              <SelectField
                label="Sucursal *"
                placeholder="Seleccionar..."
                value={cinemaId}
                options={cinemas}
                onSelect={handleCinemaChange}
                icon={MapPin}
              />
            </View>
            <View style={styles.col}>
              <SelectField
                label="Sala *"
                placeholder="Seleccionar..."
                value={roomId}
                options={rooms}
                onSelect={setRoomId}
                disabled={!cinemaId}
                loading={loadingRooms}
              />
            </View>
          </View>

          <SelectField
            label="Categoría *"
            placeholder="Tipo de evento..."
            value={eventType}
            options={eventTypes}
            onSelect={setEventType}
          />

          <View style={styles.fieldWrapper}>
            <AppText style={styles.fieldLabel}>Nombre del evento *</AppText>
            <TextInput
              style={styles.input}
              placeholder="Ej: Mi Fiesta VIP"
              placeholderTextColor={colors.textDisabled}
              value={eventName}
              onChangeText={setEventName}
              maxLength={120}
            />
          </View>

          <View style={styles.fieldWrapper}>
            <AppText style={styles.fieldLabel}>
              Descripción y requerimientos *
            </AppText>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detalles obligatorios del evento..."
              placeholderTextColor={colors.textDisabled}
              value={eventDescription}
              onChangeText={(text) => {
                if (text.length <= 500) setEventDescription(text);
              }}
              maxLength={500}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.fieldWrapper}>
            <AppText style={styles.fieldLabel}>Fecha *</AppText>
            <DateInput
              value={eventDate}
              onChange={setEventDate}
              minimumDate={dateBounds.min}
              maximumDate={dateBounds.max}
              renderTrigger={(open, displayValue) => (
                <TouchableOpacity
                  style={styles.inputWithIcon}
                  onPress={open}
                  activeOpacity={0.8}
                >
                  <Calendar size={16} color={colors.textSecondary} />
                  <AppText
                    style={[
                      styles.pickerText,
                      !displayValue && styles.pickerPlaceholder,
                    ]}
                  >
                    {displayValue || 'DD/MM/AAAA'}
                  </AppText>
                </TouchableOpacity>
              )}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <AppText style={styles.fieldLabel}>Hora inicio *</AppText>
              <TimeInput
                title="Hora inicio"
                value={startTime}
                onChange={setStartTime}
              />
            </View>
            <View style={styles.col}>
              <AppText style={styles.fieldLabel}>Hora fin *</AppText>
              <TimeInput
                title="Hora fin"
                value={endTime}
                onChange={setEndTime}
              />
            </View>
          </View>

          <View style={styles.fieldWrapper}>
            <AppText style={styles.fieldLabel}>Asistentes *</AppText>
            <View style={styles.inputWithIcon}>
              <Users size={16} color={colors.textSecondary} />
              <TextInput
                style={styles.inputInline}
                placeholder="0"
                placeholderTextColor={colors.textDisabled}
                value={attendees}
                onChangeText={(v) => setAttendees(v.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          </View>

          <View style={styles.note}>
            <Info size={16} color={colors.primary} />
            <AppText style={styles.noteText}>
              <AppText style={styles.noteBold}>Nota importante:</AppText>{' '}
              Solicitud con un mínimo de 2 semanas (14 días) de anticipación.
            </AppText>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={colors.textBlack} />
            ) : (
              <AppText style={styles.submitText}>Solicitar alquiler</AppText>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Alerta simple (éxito / error) */}
      <Modal
        visible={!!alert}
        transparent
        animationType="fade"
        onRequestClose={() => setAlert(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => {
            const wasSuccess = alert?.type === 'success';
            setAlert(null);
            if (wasSuccess) router.back();
          }}
        >
          <Pressable style={styles.alertCard}>
            <AppText
              style={[
                styles.alertTitle,
                {
                  color:
                    alert?.type === 'success' ? colors.success : colors.error,
                },
              ]}
            >
              {alert?.type === 'success' ? '¡Solicitud enviada!' : 'Atención'}
            </AppText>
            <AppText style={styles.alertMessage}>{alert?.message}</AppText>
            <TouchableOpacity
              style={styles.alertBtn}
              onPress={() => {
                const wasSuccess = alert?.type === 'success';
                setAlert(null);
                if (wasSuccess) router.back();
              }}
            >
              <AppText style={styles.alertBtnText}>Entendido</AppText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s12,
  },
  topBarTitle: {
    color: colors.primary,
    fontSize: 18,
    fontFamily: theme.typography.family.primary.bold,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: {
    paddingHorizontal: spacing.s16,
    paddingBottom: spacing.s32,
  },
  intro: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.s16,
  },
  row: { flexDirection: 'row', gap: spacing.s12 },
  col: { flex: 1 },
  fieldWrapper: { marginBottom: spacing.s16 },
  fieldLabel: {
    color: colors.textAccent.gold,
    fontSize: 12,
    fontFamily: theme.typography.family.primary.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.s8,
  },
  selectBox: {
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
  selectBoxDisabled: { opacity: 0.5 },
  selectText: { flex: 1, color: colors.textPrimary, fontSize: 14 },
  selectPlaceholder: { color: colors.textDisabled },
  input: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    borderRadius: borderRadius.s8,
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s12,
    color: colors.textPrimary,
    fontSize: 14,
  },
  textArea: { height: 96, paddingTop: spacing.s12 },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s8,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.midnight[700],
    borderRadius: borderRadius.s8,
    paddingHorizontal: spacing.s12,
  },
  inputInline: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: spacing.s12,
  },
  pickerText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: spacing.s12,
  },
  pickerPlaceholder: { color: colors.textDisabled },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.s8,
    backgroundColor: 'rgba(246,173,56,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(246,173,56,0.3)',
    borderRadius: borderRadius.s8,
    padding: spacing.s12,
    marginVertical: spacing.s16,
  },
  noteText: { flex: 1, color: colors.gold[200], fontSize: 12, lineHeight: 18 },
  noteBold: { fontFamily: theme.typography.family.primary.bold },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.s8,
    paddingVertical: spacing.s16,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: {
    color: colors.textBlack,
    fontSize: 15,
    fontFamily: theme.typography.family.primary.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Modal selector
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.s24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.s16,
    padding: spacing.s16,
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  modalTitle: {
    color: colors.primary,
    fontSize: 15,
    fontFamily: theme.typography.family.primary.bold,
    marginBottom: spacing.s12,
  },
  modalEmpty: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: spacing.s16,
  },
  modalOption: {
    paddingVertical: spacing.s12,
    paddingHorizontal: spacing.s12,
    borderRadius: borderRadius.s8,
  },
  modalOptionActive: { backgroundColor: 'rgba(246,173,56,0.14)' },
  modalOptionText: { color: colors.textPrimary, fontSize: 14 },
  modalOptionTextActive: {
    color: colors.primary,
    fontFamily: theme.typography.family.primary.bold,
  },
  // Alerta
  alertCard: {
    width: '100%',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.s16,
    padding: spacing.s24,
    borderWidth: 1,
    borderColor: colors.midnight[700],
  },
  alertTitle: {
    fontSize: 17,
    fontFamily: theme.typography.family.primary.bold,
    marginBottom: spacing.s8,
  },
  alertMessage: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.s16,
  },
  alertBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.s8,
    paddingVertical: spacing.s12,
    alignItems: 'center',
  },
  alertBtnText: {
    color: colors.textBlack,
    fontFamily: theme.typography.family.primary.bold,
  },
});
