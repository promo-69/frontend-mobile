import { Pencil } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../../constants';
import { AppText } from '../ui/AppText';

export function FormEditProfile({
  profile,
  step,
  onEdit,
  onSave,
  onCancel,
  loading,
}) {
  const isEditing = step === 'editing';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+58');
  const [phoneBody, setPhoneBody] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setEmail(profile.personalEmail || profile.email || '');
      const rawPhone = profile.phoneNumber || '';
      if (rawPhone.startsWith('+')) {
        setPhonePrefix(rawPhone.substring(0, 3));
        setPhoneBody(rawPhone.substring(3));
      } else {
        setPhoneBody(rawPhone);
      }
    }
    setErrors({});
  }, [profile, step]);

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    if (!firstName.trim()) {
      newErrors.firstName = 'El nombre es obligatorio';
      isValid = false;
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'El apellido es obligatorio';
      isValid = false;
    }

    if (!email.includes('@')) {
      newErrors.email = 'Correo inválido';
      isValid = false;
    }

    const originalPhone = profile?.phoneNumber || '';
    const currentPhone = `${phonePrefix}${phoneBody}`;
    const hasNameChanged =
      firstName.trim() !== (profile?.firstName || '').trim() ||
      lastName.trim() !== (profile?.lastName || '').trim();
    const hasEmailChanged =
      email.trim().toLowerCase() !==
      (profile?.personalEmail || profile?.email || '').trim().toLowerCase();
    const hasPhoneChanged = currentPhone.trim() !== originalPhone.trim();

    if (!hasNameChanged && !hasEmailChanged && !hasPhoneChanged) {
      newErrors.email = 'No has realizado ninguna modificación en tus datos.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (loading) return;
    if (isEditing && validate()) {
      onSave({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        cellphone: `${phonePrefix}${phoneBody}`,
      });
    }
  };

  const handleTogglePrefix = () => {
    setPhonePrefix((prev) => (prev === '+58' ? '+57' : '+58'));
  };

  // ─── READ-ONLY FIELD ────────────────────────────────────────────────
  const renderReadOnlyField = (label, value) => (
    <View style={styles.fieldContainer}>
      <AppText variant="small" style={styles.fieldLabel}>
        {label}
      </AppText>
      <AppText variant="body" style={styles.fieldValue} numberOfLines={1}>
        {value || 'No asignado'}
      </AppText>
      <View style={styles.underline} />
    </View>
  );

  // ─── EDITABLE FIELD ─────────────────────────────────────────────────
  const renderEditableField = (
    label,
    value,
    onChangeText,
    errorKey,
    options = {}
  ) => (
    <View style={styles.fieldContainer}>
      <AppText variant="small" style={styles.fieldLabel}>
        {label}
      </AppText>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          editable={isEditing && !loading}
          autoCapitalize={options.autoCapitalize || 'none'}
          keyboardType={options.keyboardType || 'default'}
          placeholderTextColor="rgba(255,255,255,0.2)"
          placeholder={options.placeholder}
        />
        <Pencil
          size={14}
          color={theme.colors.textSecondary}
          style={{ opacity: 0.4 }}
        />
      </View>
      <View
        style={[styles.underline, errors[errorKey] && styles.underlineError]}
      />
      {errors[errorKey] && (
        <AppText variant="small" style={styles.errorText}>
          {errors[errorKey]}
        </AppText>
      )}
    </View>
  );

  // ─── PHONE FIELD (with prefix) ──────────────────────────────────────
  const renderPhoneField = () => (
    <View style={styles.fieldContainer}>
      <AppText variant="small" style={styles.fieldLabel}>
        Teléfono
      </AppText>
      <View style={styles.phoneRow}>
        <TouchableOpacity
          style={styles.prefixButton}
          onPress={handleTogglePrefix}
          disabled={!isEditing || loading}
        >
          <AppText variant="body" style={styles.prefixText}>
            {phonePrefix}
          </AppText>
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          value={phoneBody}
          onChangeText={setPhoneBody}
          editable={isEditing && !loading}
          keyboardType="phone-pad"
          placeholderTextColor="rgba(255,255,255,0.2)"
          placeholder="4121234567"
        />
        {isEditing && (
          <Pencil
            size={14}
            color={theme.colors.textSecondary}
            style={{ opacity: 0.4 }}
          />
        )}
      </View>
      <View style={[styles.underline, errors.phone && styles.underlineError]} />
      {errors.phone && (
        <AppText variant="small" style={styles.errorText}>
          {errors.phone}
        </AppText>
      )}
    </View>
  );

  // ─── RENDER ─────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Read-only fields (grid 2 cols) */}

      {/* Editable fields */}
      {isEditing ? (
        <>
          <View style={styles.readOnlyGrid}>
            <View style={styles.halfField}>
              {renderEditableField(
                'Nombre',
                firstName,
                setFirstName,
                'firstName'
              )}
            </View>
            <View style={styles.halfField}>
              {renderEditableField(
                'Apellido',
                lastName,
                setLastName,
                'lastName'
              )}
            </View>
          </View>
          {renderEditableField('Correo', email, setEmail, 'email')}
          {renderPhoneField()}
        </>
      ) : (
        <>
          {renderReadOnlyField('Nombre', profile?.firstName)}
          {renderReadOnlyField('Apellido', profile?.lastName)}
          {renderReadOnlyField(
            'Correo',
            profile?.personalEmail || profile?.email
          )}
          {renderReadOnlyField('Teléfono', profile?.phoneNumber)}
        </>
      )}

      {/* Buttons */}
      <View style={styles.buttonRow}>
        {isEditing && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onCancel}
            disabled={loading}
          >
            <AppText variant="button" style={styles.backButtonText}>
              Volver
            </AppText>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            isEditing ? styles.saveButton : styles.editButton,
            loading && styles.buttonDisabled,
          ]}
          onPress={isEditing ? handleSubmit : onEdit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.background.main}
            />
          ) : (
            <AppText
              variant="button"
              style={isEditing ? styles.saveButtonText : styles.editButtonText}
            >
              {isEditing ? 'Guardar' : 'Editar'}
            </AppText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: theme.spacing.s16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  readOnlyGrid: {
    flexDirection: 'row',
    gap: theme.spacing.s16,
    marginBottom: theme.spacing.s4,
  },
  halfField: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: theme.spacing.s16,
  },
  fieldLabel: {
    color: theme.colors.textSecondary,
    opacity: 0.5,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  fieldValue: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    paddingVertical: 6,
    opacity: 0.8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 15,
    paddingVertical: 6,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefixButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: theme.spacing.s8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  prefixText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  underline: {
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 2,
  },
  underlineError: {
    backgroundColor: theme.colors.error || '#ef4444',
  },
  errorText: {
    color: theme.colors.error || '#ef4444',
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.s12,
    marginTop: theme.spacing.s8,
  },
  backButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  editButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  editButtonText: {
    color: theme.colors.background.main || '#231640',
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.colors.background.main || '#231640',
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
