import { useState, useEffect } from 'react';
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
      setProfile(result?.data || result);
      setError(null);
    } catch (err) {
      console.error('Error al cargar perfil:', err);
      setError('No se pudieron cargar los datos del perfil');
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
      
      const result = await userService.updateProfile(payload);
      
      if (result || result?.success) {
        await loadProfile(); 
        return { success: true };
      }
      return { success: false, message: result?.message || 'Error al actualizar datos personales' };
    } catch (err) {
      console.error('Error en updateProfileData:', err);
      return { success: false, message: err.message || 'Error inesperado' };
    } finally {
      setIsUpdating(false);
    }
  };

  const updateSecurity = async (securityData) => {
    setIsUpdating(true);
    try {
  
      const payload = {
        currentPassword: securityData.currentPassword,
        email: securityData.email,
        newPassword: securityData.newPassword || undefined,
      };

      const result = await userService.updateSecurity(payload);
      
      if (result || result?.success) {
        await loadProfile(); 
        return { success: true };
      }
      return { success: false, message: result?.message || 'Error al actualizar credenciales' };
    } catch (err) {
      console.error('Error en updateSecurity:', err);
      return { success: false, message: err.message || 'Contraseña actual incorrecta o formato inválido' };
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
    loadProfile
  };

}