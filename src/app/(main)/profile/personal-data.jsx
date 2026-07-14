import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { AppText } from '../../../components/ui/AppText';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { SuccessModal } from '../../../components/ui/SuccessModal';
import { FormEditProfile } from '../../../components/profile/FormEditProfile';
import { PasswordVerifyModal } from '../../../components/profile/PasswordVerifyModal';
import { theme } from '../../../constants';
import { useProfile } from '../../../hooks/profile/useProfile';

export default function PersonalDataScreen() {
  const router = useRouter();
  const {
    profile,
    loading,
    isUpdating,
    updateProfileData,
    verifySecurity,
    changeSecurity,
  } = useProfile();

  const [step, setStep] = useState('view');
  const [securityToken, setSecurityToken] = useState(null);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  // Verify identity → get security token → enable editing
  const handleVerifyIdentity = async (password) => {
    const res = await verifySecurity(password);
    if (res.success && res.token) {
      setSecurityToken(res.token);
      setStep('editing');
    } else {
      throw new Error(res.message || 'Contraseña incorrecta');
    }
  };

  // Save changes: security (email/password) + profile (phone)
  const handleSave = async (updatedData) => {
    if (!securityToken) {
      setStep('view');
      return;
    }

    const currentEmail = (
      profile?.personalEmail ||
      profile?.email ||
      ''
    ).trim().toLowerCase();
    const targetEmail = updatedData.email.trim().toLowerCase();
    const hasEmailChanged = targetEmail !== currentEmail;
    const hasPasswordChanged = !!updatedData.password;

    // Aplicar cambios en la contraseña 
    if (hasEmailChanged || hasPasswordChanged) {
      const securityPayload = { securityChangeToken: securityToken };
      if (hasEmailChanged) securityPayload.newEmail = updatedData.email.trim();
      if (hasPasswordChanged) securityPayload.newPassword = updatedData.password;

      const secRes = await changeSecurity(securityPayload);
      if (!secRes.success) {
        alert(secRes.message || 'Error al actualizar credenciales');
        return;
      }
    }

    // Aplicar cambios (numero de telefono) 
    const currentPhone = (profile?.phoneNumber || '').trim();
    const targetPhone = updatedData.cellphone.trim();
    const hasPhoneChanged = targetPhone !== currentPhone;

    if (hasPhoneChanged) {
      const profileRes = await updateProfileData({ phoneNumber: targetPhone });
      if (!profileRes.success) {
        alert(profileRes.message || 'Error al actualizar teléfono');
        return;
      }
    }

    // Success
    setSecurityToken(null);
    setStep('view');
    setIsSuccessVisible(true);
  };

  const handleCancelEdit = () => {
    setSecurityToken(null);
    setStep('view');
  };

  if (loading) {
    return (
      <ScreenWrapper style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="body" style={styles.description}>
          Gestiona tu información personal
        </AppText>

        <FormEditProfile
          profile={profile}
          step={step}
          onEdit={() => setStep('confirming')}
          onSave={handleSave}
          onCancel={handleCancelEdit}
          loading={isUpdating}
        />
      </ScrollView>

      {/* Modal de verificaciond e contraseña */}
      <PasswordVerifyModal
        visible={step === 'confirming'}
        onConfirm={handleVerifyIdentity}
        onCancel={() => setStep('view')}
        loading={isUpdating}
      />

      {/* Success modal */}
      <SuccessModal
        visible={isSuccessVisible}
        message="Tu información de perfil ha sido actualizada con éxito."
        onClose={() => {
          setIsSuccessVisible(false);
          router.back();
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.s24,
    paddingBottom: theme.spacing.s32,
  },
  description: {
    color: theme.colors.textSecondary,
    opacity: 0.6,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: theme.spacing.s24,
  },
});
