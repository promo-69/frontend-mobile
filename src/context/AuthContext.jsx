import { createContext, useContext, useEffect, useState } from 'react';
import { normalizeLoginError } from '../helper/error.helper';
import { storageHelper } from '../helper/storage.helper';
import { authService } from '../services/auth.service';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const userData = await storageHelper.getUserData();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error al restaurar sesión:', error);
      await storageHelper.clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja el flujo de inicio de sesión
   * @param {Object} credentials - { email, password }
   */
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const payload = response?.data ?? response;

      const { accessToken, refreshToken, user: userData } = payload;

      // Guardamos exactamente el objeto user que viene del backend
      // y mantenemos la convención firstName / lastName.
      await storageHelper.saveSession(accessToken, refreshToken, userData);
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: normalizeLoginError(error),
        status: error?.response?.status ?? null,
      };
    }
  };

  /**
   * Maneja el registro 
   */
  const register = async (formData) => {
    try {
      const response = await authService.register(formData);
      const payload = response?.data ?? response;
      const { accessToken, refreshToken, user: userData } = payload;

      await storageHelper.saveSession(accessToken, refreshToken, userData);
      setUser(userData);

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error en el registro';
      return { success: false, message };
    }
  };

  /**
   * Cierre de sesión
   */
  const logout = async () => {
    try {
      // Intentamos avisar al backend (opcional)
      await authService.logout().catch(() => {});
    } finally {
      // Siempre limpiamos localmente, falle o no la red
      await storageHelper.clearSession();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        login, 
        register, 
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para facilitar el uso en pantallas
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
