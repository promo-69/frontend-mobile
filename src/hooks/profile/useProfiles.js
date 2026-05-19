import { useState, useEffect } from 'react';
import { userService } from '../../services/users.service';

export const useProfiles = () => {
  const loadProfiles = async() => {
    setLoading(true);
    try {
      const result = await userService.getProfile();
      setProfile(result);
      setError(null);
    }
    catch (error) {
      console.error('Error al cargar perfil:', error);
      setError('No se pudieron cargar los datos del perfil');
      setProfile(null);
    }
    finally {
      setLoading(false);
    }
 }

 const updateProfile = async (newProfileData) => {
    setIsUpdating(true);
    try {
      const result = await userService.updateProfile(newProfileData);
      setProfile(result);
      
      if(result.success){
        await loadProfile();
      }
      
      return { 
        success: true, 
        message: 'Perfil actualizado exitosamente'
      };

    } catch (error) {
      return { success: false };

    } finally {
      setIsUpdating(false); // Libera el botón
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return { profile, loading, isUpdating, updateProfile };

}