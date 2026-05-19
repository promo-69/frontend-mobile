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

 
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      
      if (!response?.success) {
      return { success: false, message: response?.message || 'Error de autenticación' };
    }
    
      const { user, tokens } = response.data;
      
      const { accessToken, refreshToken } = tokens;
      
      await storageHelper.saveSession(accessToken, refreshToken, user);
      
      setUser(user);

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
    const response = await authService.signup(formData);
    return { success: true, message: response?.message || 'Registro exitoso.' };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Error en el registro' 
    };
  }
};

  /**
   * Cierre de sesión
   */
  const logout = async () => {
    try {
      await authService.logout().catch(() => {});
    } finally {
      await storageHelper.clearSession();
      setUser(null);
    }
  };

  /**
   * Verificar correo (Paso obligatorio post-registro)
   */
  const verifyAccount = async (email, code) => {
    try {
      await authService.verifyEmail({ email, code });
      return { success: true, message: 'Cuenta verificada exitosamente.' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Cuenta no verificada exitosamente.'
      };
    }
  };

  /**
   * RECUPERAR CONTRASEÑA - PASO 1 (Enviar correo)
   */
  const sendRecoveryEmail = async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      return { success: true, message: response?.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al procesar la solicitud.'
      };
    }
  };

  /**
   * RECUPERAR CONTRASEÑA - PASO 2 (Validar código de 4 dígitos)
   * Retorna el token de 64 caracteres necesario para el paso final
   */
  const verifyRecoveryCode = async (email, code) => {
    try {
      const response = await authService.verifyResetCode({ email, code });
      return { success: true, data: response }; // Aquí viaja el { resetToken }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Código inválido o expirado.'
      };
    }
  };

  /**
   * RECUPERAR CONTRASEÑA - PASO 3 (Establecer nueva contraseña con el token de 64 caracteres)
   */
  const resetPassword = async ({ email, resetToken, newPassword }) => {
    try {
      const response = await authService.resetPassword({ email, resetToken, newPassword });
      return { success: true, message: response?.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'No se pudo restablecer la contraseña.'
      };
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
        isAuthenticated: !!user,
        verifyAccount,
        sendRecoveryEmail,
        verifyRecoveryCode,
        resetPassword
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
