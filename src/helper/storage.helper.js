import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

/**
 * Centraliza la persistencia de tokens y datos de usuario
 */
export const storageHelper = {
  
  /**
   * Guarda los tokens de acceso y refresco de forma simultánea
   */
  saveTokens: async (accessToken, refreshToken) => {
    try {
      const pairs = [];

      if (accessToken !== undefined && accessToken !== null) {
        pairs.push([STORAGE_KEYS.ACCESS_TOKEN, accessToken]);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      }

      if (refreshToken !== undefined && refreshToken !== null) {
        pairs.push([STORAGE_KEYS.REFRESH_TOKEN, refreshToken]);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      }

      if (pairs.length > 0) {
        await AsyncStorage.multiSet(pairs);
      }
    } catch (error) {
      console.error('Error al guardar tokens:', error);
      throw error;
    }
  },

  /**
   * Guarda la sesión completa (Tokens + Datos de usuario)
   */
  saveSession: async (accessToken, refreshToken, userData) => {
    try {
      const pairs = [];

      if (accessToken !== undefined && accessToken !== null) {
        pairs.push([STORAGE_KEYS.ACCESS_TOKEN, accessToken]);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      }

      if (refreshToken !== undefined && refreshToken !== null) {
        pairs.push([STORAGE_KEYS.REFRESH_TOKEN, refreshToken]);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      }

      if (userData !== undefined && userData !== null) {
        pairs.push([STORAGE_KEYS.USER, JSON.stringify(userData)]);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      }

      if (pairs.length > 0) {
        await AsyncStorage.multiSet(pairs);
      }
    } catch (error) {
      console.error('Error al guardar sesión:', error);
      throw error;
    }
  },

  /**
   * Permite actualizar ÚNICAMENTE los datos del usuario (Ideal para tus pantallas de perfil)
   */
  updateUserData: async (newUserData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUserData));
    } catch (error) {
      console.error('Error al actualizar datos de usuario en storage:', error);
      throw error;
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
   * Obtiene los datos del usuario parseados con auto-limpieza si el JSON está corrupto
   */
  getUserData: async () => {
    try {
      const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      
      if (!user) return null;

      // Anti-Bug: Si por error se guardó un string vacío o corrupto que burla el if anterior
      if (user.trim() === "" || user === "{}" || user === "[object Object]") {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
        return null;
      }

      return JSON.parse(user);
    } catch (error) {
      console.error('Error al parsear USER de AsyncStorage. Limpiando llave corrupta...', error);
      // Si el JSON está roto, lo borramos inmediatamente para evitar bucles de error en la UI
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
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
      console.error('Error al limpiar sesión en Async Storage:', error);
      throw error;
    }
  }

  /**
   * NUEVO: Guarda cualquier valor de tipo string de manera genérica
   */
  saveValue: async (key, value) => {
    try {
      if (value !== undefined && value !== null) {
        await AsyncStorage.setItem(key, String(value));
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error al guardar la llave ${key} en storage:`, error);
      throw error;
    }
  },

  /**
   * NUEVO: Obtiene cualquier valor de tipo string de manera genérica
   */
  getValue: async (key) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error al obtener la llave ${key} de storage:`, error);
      return null;
    }
  },
  /**
   * NUEVO: Guarda cualquier valor de tipo string de manera genérica
   */
  saveValue: async (key, value) => {
    try {
      if (value !== undefined && value !== null) {
        await AsyncStorage.setItem(key, String(value));
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error al guardar la llave ${key} en storage:`, error);
      throw error;
    }
  },

  /**
   * NUEVO: Obtiene cualquier valor de tipo string de manera genérica
   */
  getValue: async (key) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error al obtener la llave ${key} de storage:`, error);
      return null;
    }
  }
};