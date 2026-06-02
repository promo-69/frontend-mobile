import { createContext, useContext, useEffect, useState } from 'react';
import { getErrorMessage, AUTH_ERRORS } from '../constants/errorMessages';
import { storageHelper } from '../helper/storage.helper';
import { jwtHelper } from '../helper/jwt.helper';
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
      // Obtenemos los datos y los tokens persistidos de forma concurrente
      const [userData, accessToken, refreshToken] = await Promise.all([
        storageHelper.getUserData(),
        storageHelper.getAccessToken(),
        storageHelper.getRefreshToken(),
      ]);

      if (userData && accessToken) {
        // 1. Verificar si el Access Token ha expirado
        if (jwtHelper.isExpired(accessToken)) {
          console.log('Access token expirado. Verificando refresh token...');

          if (refreshToken) {
            // 2. Verificar si el Refresh Token también expiró
            if (jwtHelper.isExpired(refreshToken)) {
              console.warn('Sesión completamente expirada (Refresh Token vencido).');
              await logout();
              return;
            }

            // 3. Intentar renovar la sesión proactivamente
            const response = await authService.refreshToken();
            if (!response.success) {
              throw new Error('No se pudo renovar la sesión');
            }
          } else {
            // No hay refresh token para rescatar la sesión
            await logout();
            return;
          }
        }

        setUser(userData);
      }
      else {
        await logout();
      }
    } catch (error) {
      console.error('Error al restaurar sesión:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

 
  const login = async (credentials) => {
  try {
    const response = await authService.login(credentials);
    
    if (!response?.success) {
      return { 
        success: false, 
        code: response?.code,
        message: getErrorMessage(response?.code) 
      };
    }
  
    const { user, tokens } = response.data;
    const { accessToken, refreshToken } = tokens;
    
    await storageHelper.saveSession(accessToken, refreshToken, user);
    setUser(user);

    return { success: true };

  } catch (error) {
    console.log('📝 [DEBUG CONTEXT] Error capturado en login:', error.response?.data);
    
    // Extraemos el mensaje y el code directamente del payload de error de la API
    const backendCode = error.response?.data?.code; // Ej: "UNVERIFIED_ACCOUNT"

    return {
      success: false,
      message: getErrorMessage(backendCode),
      code: backendCode || null, 
      status: error.response?.status ?? null,
    };
  }
};
  /**
   * Maneja el registro 
   */
  const register = async (formData) => {
  try {
    const response = await authService.signUp(formData);
    return { success: true, message: response?.message || 'Registro exitoso.' };
  } catch (error) {
    console.error(' [Backend Register Error Request]:', error.config?.url);
    if (error.response) {
      console.error(' [Backend Response Data]:', JSON.stringify(error.response.data, null, 2));
      console.error(' [Backend Status Code]:', error.response.status);
    } else if (error.request) {
      console.error(' [No response received from Server]:', error.request);
    } else {
      console.error(' [Axios Setup Error]:', error.message);
    }

    return {
      success: false,
      // Extrae el mensaje específico de tu API (ej. "El correo ya está registrado")
      message: error.response?.data?.message || error.response?.data?.error || 'No se pudo completar el registro.'
    };
  }
};

  /**
   * Cierre de sesión
   */
  const logout = async () => {
  try {
    setIsLoading(true); 

    try {
      const response=await authService.logout(); 
      console.log(response.message);
    } catch (apiError) { 
      console.warn('El servidor no pudo procesar el logout o el token expiró:', apiError);
    }

    await storageHelper.clearSession();

    setUser(null);
    
    console.log('Sesión destruida localmente con éxito.');
  } catch (error) {
    console.error('Error crítico en el proceso de logout:', error);
  } finally {
    setIsLoading(false);
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
