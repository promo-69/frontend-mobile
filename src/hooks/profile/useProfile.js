import { useEffect, useState } from 'react';
import { usersService } from '../../services/users.service';

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Método para obtener los datos frescos del perfil (GET)
  const loadProfile = async () => {
    setLoading(true);
    try {
      const result = await usersService.getProfile();
      const raw = result?.data || result;

      // Normalizar campos que pueden venir en distintas formas desde el backend
      const normalized = {
        ...raw,
        firstName:
          raw?.firstName ||
          raw?._People?.first_name ||
          raw?._People?.firstName ||
          '',
        lastName:
          raw?.lastName ||
          raw?._People?.last_name ||
          raw?._People?.lastName ||
          '',
        personalEmail:
          raw?.personalEmail ||
          raw?._People?.personal_email ||
          raw?._People?.personalEmail ||
          '',
        phoneNumber:
          raw?.phoneNumber ||
          raw?._People?.phone_number ||
          raw?._People?.phoneNumber ||
          '',
        email: raw?.email || raw?.mail || '',
      };

      setProfile(normalized);
      setError(null);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los datos del perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (newProfileData) => {
    setIsUpdating(true);
    try {
      const payload = {
        firstName: newProfileData.firstName,
        lastName: newProfileData.lastName,
        phoneNumber: newProfileData.phoneNumber,
        personalEmail: newProfileData.personalEmail,
      };

      const result = await usersService.updateProfile(payload);

      if (result || result?.success) {
        await loadProfile();
        return { success: true };
      }
      return {
        success: false,
        message: result?.message || 'Error al actualizar datos personales',
      };
    } catch (err) {
      const msg = err?.message || 'Error inesperado al actualizar datos';
      return { success: false, message: msg };
    } finally {
      setIsUpdating(false);
    }
  };

  const updateSecurity = async (securityData) => {
    setIsUpdating(true);
    try {
      // Mantener compatibilidad: realizar verificación y cambio en secuencia
      const verifyRes = await verifySecurity(securityData.currentPassword);
      if (!verifyRes.success)
        return { success: false, message: verifyRes.message };

      const changePayload = { securityChangeToken: verifyRes.token };
      if (securityData.newPassword)
        changePayload.newPassword = securityData.newPassword;
      if (securityData.email) changePayload.newEmail = securityData.email;

      const changeRes = await changeSecurity(changePayload);
      return changeRes;
    } catch (err) {
      const msg = err?.message || 'Error al actualizar credenciales';
      return { success: false, message: msg };
    } finally {
      setIsUpdating(false);
    }
  };

  const verifySecurity = async (currentPassword) => {
    setIsUpdating(true);
    try {
      const verifyRes = await usersService.verifySecurity(currentPassword);

      let token =
        verifyRes?.data?.securityChangeToken ||
        verifyRes?.data?.data?.securityChangeToken ||
        verifyRes?.securityChangeToken ||
        verifyRes?.data?.token;

      if (!token) {
        return {
          success: false,
          message: verifyRes?.message || 'Contraseña incorrecta',
        };
      }

      return { success: true, token };
    } catch (err) {
      const msg = err?.message || 'Error al verificar contraseña';
      return { success: false, message: msg };
    } finally {
      setIsUpdating(false);
    }
  };

  const changeSecurity = async ({
    securityChangeToken,
    newPassword,
    newEmail,
  } = {}) => {
    setIsUpdating(true);
    try {
      const changeRes = await usersService.changeSecurity({
        securityChangeToken,
        newPassword,
        newEmail,
      });
      const ok =
        changeRes?.success === true ||
        changeRes?.status === 'ok' ||
        !!changeRes;
      if (ok) {
        await loadProfile();
        return { success: true };
      }
      const msg =
        changeRes?.message ||
        changeRes?.data?.message ||
        'Error al actualizar credenciales';
      return { success: false, message: msg };
    } catch (err) {
      const msg = err?.message || 'Error al aplicar cambio de seguridad';
      return { success: false, message: msg };
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    loading,
    isUpdating,
    error,
    updateProfileData,
    updateSecurity,
    verifySecurity,
    changeSecurity,
    loadProfile,
  };
};
