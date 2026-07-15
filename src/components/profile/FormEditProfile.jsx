import { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Eye, EyeOff, Pencil } from 'lucide-react-native';
import { AppText } from '../ui/AppText';
import { theme } from '../../constants';

const PASS_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/;

export function FormEditProfile({ profile, step, onEdit, onSave, onCancel, loading }) {
  const isEditing = step === 'editing';

  const [email, setEmail] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+58');
  const [phoneBody, setPhoneBody] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile) {
      setEmail(profile.personalEmail || profile.email || '');
      const rawPhone = profile.phoneNumber || '';
      if (rawPhone.startsWith('+')) {
        setPhonePrefix(rawPhone.substring(0, 3));
        setPhoneBody(rawPhone.substring(3));
      } else {
        setPhoneBody(rawPhone);
      }
    }
    setPassword('');
    setShowPassword(false);
    setErrors({});
  }, [profile, step]);

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    if (!email.includes('@')) {
      newErrors.email = 'Correo inválido';
      isValid = false;
    }

    if (password.length > 0 && !PASS_REGEX.test(password)) {
      newErrors.password = '8-20 caracteres, letras, números y símbolos';
      isValid = false;
    }

    const originalPhone = profile?.phoneNumber || '';
    const currentPhone = `${phonePrefix}${phoneBody}`;
    const hasEmailChanged =
      email.trim().toLowerCase() !== (profile?.personalEmail || profile?.email || '').trim().toLowerCase();
    const hasPhoneChanged = currentPhone.trim() !== originalPhone.trim();
    const hasPasswordChanged = password.length > 0;

    if (!hasEmailChanged && !hasPasswordChanged && !hasPhoneChanged) {
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
        email: email.trim(),
        password: password.length > 0 ? password : undefined,
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
    options = {},
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
        <Pencil size={14} color={theme.colors.textSecondary} style={{ opacity: 0.4 }} />
      </View>
      <View
        style={[
          styles.underline,
          errors[errorKey] && styles.underlineError,
        ]}
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
          <Pencil size={14} color={theme.colors.textSecondary} style={{ opacity: 0.4 }} />
        )}
      </View>
      <View
        style={[
          styles.underline,
          errors.phone && styles.underlineError,
        ]}
      />
      {errors.phone && (
        <AppText variant="small" style={styles.errorText}>
          {errors.phone}
        </AppText>
      )}
    </View>
  );

  // ─── PASSWORD FIELD ─────────────────────────────────────────────────
  const renderPasswordField = () => (
    <View style={styles.fieldContainer}>
      <AppText variant="small" style={styles.fieldLabel}>
        {isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
      </AppText>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          value={password}
          onChangeText={setPassword}
          editable={isEditing && !loading}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          placeholderTextColor="rgba(255,255,255,0.2)"
          placeholder={isEditing ? 'Escribe para cambiar tu clave...' : ''}
        />
        {isEditing && (
          <View style={styles.passwordActions}>
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              {showPassword ? (
                <EyeOff size={16} color={theme.colors.textSecondary} />
              ) : (
                <Eye size={16} color={theme.colors.textSecondary} />
              )}
            </TouchableOpacity>
            <Pencil size={14} color={theme.colors.textSecondary} style={{ opacity: 0.4 }} />
          </View>
        )}
      </View>
      <View
        style={[
          styles.underline,
          errors.password && styles.underlineError,
        ]}
      />
      {errors.password && (
        <AppText variant="small" style={styles.errorText}>
          {errors.password}
        </AppText>
      )}
    </View>
  );

  // ─── RENDER ─────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Read-only fields (grid 2 cols) */}
      <View style={styles.readOnlyGrid}>
        <View style={styles.halfField}>
          {renderReadOnlyField('Nombre', profile?.firstName)}
        </View>
        <View style={styles.halfField}>
          {renderReadOnlyField('Apellido', profile?.lastName)}
        </View>
      </View>

      {/* Editable fields */}
      {isEditing ? (
        <>
          {renderEditableField('Correo', email, setEmail, 'email')}
          {renderPhoneField()}
          {renderPasswordField()}
        </>
      ) : (
        <>
          {renderReadOnlyField('Correo', profile?.personalEmail || profile?.email)}
          {renderReadOnlyField('Teléfono', profile?.phoneNumber)}
          {renderReadOnlyField('Contraseña', '••••••••')}
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
            <ActivityIndicator size="small" color={theme.colors.background.main} />
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
  passwordActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyeButton: {
    padding: 4,
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
