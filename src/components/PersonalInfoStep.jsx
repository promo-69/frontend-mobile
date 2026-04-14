import { ScrollView, StyleSheet, View } from 'react-native';
import { theme } from '../constants';
import { AppText } from './AppText';
import { Input } from './ui/Input';

const PERSONAL_FIELDS = [
  { id: 'firstName', label: 'Nombres', autoCapitalize: 'words' },
  { id: 'lastName', label: 'Apellidos', autoCapitalize: 'words' },
  {
    id: 'email',
    label: 'Correo Electrónico',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
  },
  {
    id: 'phoneNumber',
    label: 'Teléfono',
    keyboardType: 'phoneNumber-pad',
    autoCapitalize: 'none',
  },
];

/**
 * @param {Object} formData - Estado actual del formulario. Debe contener llaves: firstName, lastName, email, phoneNumber.
 * @param {Function} onInputChange - Función callback para actualizar el estado. (key: string, value: string) => void.
 * @param {Object} [errors] - Objeto opcional con mensajes de error mapeados por ID del campo.
 */
export const PersonalInfoStep = ({ formData, onInputChange, errors = {} }) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled" // Permite clics en inputs aunque el teclado esté abierto
    >
      {/* Sección de Encabezado */}
      <View style={styles.header}>
        <AppText variant="body" style={styles.subtitle}>
          Ingresa tus datos básicos para comenzar tu experiencia en Cineflix.
        </AppText>
      </View>

      {/* Listado de Inputs Dinámicos */}
      <View style={styles.form}>
        {PERSONAL_FIELDS.map((field) => {
          return (
            <Input
              key={field.id}
              label={field.label}
              value={formData[field.id]}
              onChangeText={(text) => onInputChange(field.id, text)}
              error={errors[field.id]}
              keyboardType={field.keyboardType}
              autoCapitalize={field.autoCapitalize}
            />
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: theme.spacing.s32,
  },
  header: {
    marginBottom: theme.spacing.s24,
    alignItems: 'center',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.s16,
  },
  form: {
    gap: theme.spacing.s24,
  },
});
