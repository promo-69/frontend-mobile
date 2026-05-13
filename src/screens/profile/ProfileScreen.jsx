import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppText } from '../../components/AppText';
import { EditModal } from '../../components/Edit';
import { LogoutModal } from '../../components/LogoutModal';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { SuccessModal } from '../../components/SuccessModal';
import { CustomButton } from '../../components/ui/CustomButton';
import { Input } from '../../components/ui/Input';
import { theme } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { validateNames, validatePhoneNumberVE } from '../../utils/validators';

// --- PANTALLA PRINCIPAL DE PERFIL ---
export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { 
    isEditModalVisible, setIsEditModalVisible, 
    isSuccessVisible, setIsSuccessVisible, 
    isUpdating, handleFinalUpdate 
  } = useProfile();
  
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

 const { control, handleSubmit, getValues, formState: { isDirty } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
    }
});

  const onSavePress = () => setIsEditModalVisible(true);
  const handleLogoutPress = () => setIsLogoutModalVisible(true);

   return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={28} color={theme.colors.border} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>
          Editar Perfil
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.formContent}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <AppText variant="h1" style={{ color: theme.colors.primary }}>
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </AppText>
          </View>
          <AppText variant="body" style={styles.userEmail}>
            {user?.email}
          </AppText>
        </View>

        <View style={styles.inputsGroup}>
          <Controller
            control={control}
            name="firstName"
            rules={{
              required: 'El nombre es obligatorio',
              validate: validateNames,
            }}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                label="Nombres"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={error?.message}
                autoCapitalize="words"
              />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            rules={{
              required: 'El apellido es obligatorio',
              validate: validateNames,
            }}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                label="Apellidos"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={error?.message}
                autoCapitalize="words"
              />
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            rules={{ validate: validatePhoneNumberVE }}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                label="Teléfono Móvil"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={error?.message}
                keyboardType="phone-pad"
              />
            )}
          />
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogoutPress}
          >
            <AppText style={styles.logoutText}>Cerrar Sesión</AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="GUARDAR CAMBIOS"
          onPress={handleSubmit(onSavePress)}
          disabled={!isDirty}
        />
      </View>

      <EditModal
        visible={isEditModalVisible}
        onConfirm={(pass) => handleFinalUpdate(pass, getValues())}
        onCancel={() => setIsEditModalVisible(false)}
        isLoading={isUpdating}
      />

      <SuccessModal
        visible={isSuccessVisible}
        onClose={() => setIsSuccessVisible(false)}
      />

      <LogoutModal
        visible={isLogoutModalVisible}
        onConfirm={logout}
        onCancel={() => setIsLogoutModalVisible(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s16,
    paddingTop: theme.spacing.s8,
    marginBottom: theme.spacing.s16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    color: theme.colors.primary,
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Alineación visual respecto al backbutton
  },
  formContent: {
    paddingHorizontal: theme.spacing.s24,
    paddingBottom: theme.spacing.s32,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: theme.spacing.s32,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginBottom: theme.spacing.s12,
  },
  userEmail: {
    color: theme.colors.textSecondary,
    opacity: 0.7,
  },
  inputsGroup: {
    gap: theme.spacing.s24,
  },
  footer: {
    padding: theme.spacing.s24,
    backgroundColor: 'transparent',
  },
  logoutSection: {
    marginTop: theme.spacing.s40,
    paddingTop: theme.spacing.s24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  logoutButton: {
    paddingVertical: theme.spacing.s12,
    paddingHorizontal: theme.spacing.s24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  logoutText: {
    color: '#ff4444',
    fontWeight: '600',
  },
});
