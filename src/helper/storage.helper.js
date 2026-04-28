import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/Config';

/**
 * Centraliza la persistencia de tokens y datos de usuario
 */
export const storageHelper = {
  
  /**
   * Guarda los tokens de acceso y refresco de forma simultánea
   * @param {string} accessToken - Token de corta duración para peticiones
   * @param {string} refreshToken - Token de larga duración para renovar sesión
   */
  saveTokens: async (accessToken, refreshToken) => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken]
      ]);
    } catch (error) {
      console.error('Error al guardar tokens:', error);
    }
  },

  /**
   * Guarda la sesión completa (Tokens + Datos de usuario)
   */
  saveSession: async (accessToken, refreshToken, userData) => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
        [STORAGE_KEYS.USER, JSON.stringify(userData)]
      ]);
    } catch (error) {
      console.error('Error al guardar sesión:', error);
    }
  },

  /**
   * Obtiene el Access Token para el interceptor de Axios (Bearer)
   */
  getAccessToken: async () => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      return null;
    }
  },

  /**
   * Obtiene el Refresh Token para renovar la sesión
   */
  getRefreshToken: async () => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      return null;
    }
  },

  /**
   * Obtiene los datos del usuario parseados
   */
  getUserData: async () => {
    try {
      const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Elimina toda la información (Logout)
   */
  clearSession: async () => {
    try {
      const keys = [
        STORAGE_KEYS.ACCESS_TOKEN, 
        STORAGE_KEYS.REFRESH_TOKEN, 
        STORAGE_KEYS.USER
      ];
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error al limpiar sesión:', error);
    }
  }
};