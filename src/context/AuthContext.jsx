import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { getErrorMessage } from '../constants/errorMessages';
import { jwtHelper } from '../helper/jwt.helper';
import { storageHelper } from '../helper/storage.helper';
import { authService } from '../services/auth.service';

const AuthContext = createContext({});

const CART_STORAGE_KEY = 'cineflix_cart';

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
              console.warn(
                'Sesión completamente expirada (Refresh Token vencido).'
              );
              await logout();
              return;
            }

            // 3. Intentar renovar la sesión proactivamente
            const response = await authService.refreshToken(refreshToken);
            if (!response?.success) {
              throw new Error('No se pudo renovar la sesión');
            }
            // Persistir y exponer el user fresco (trae loyaltyPoints actualizados)
            const freshUser = response.data?.user ?? null;
            if (freshUser) {
              await storageHelper.saveSession(
                response.data?.tokens?.accessToken,
                response.data?.tokens?.refreshToken,
                freshUser
              );
              setUser(freshUser);
              return;
            }
          } else {
            // No hay refresh token para rescatar la sesión
            await logout();
            return;
          }
        }

        setUser(userData);
      } else {
        setUser(null);
        await storageHelper.clearSession();
      }
    } catch (error) {
      console.error('Error al restaurar sesión:', error);
      setUser(null);
      await storageHelper.clearSession();
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
          message: getErrorMessage(response?.code),
        };
      }

      const { user, tokens } = response.data;
      const { accessToken, refreshToken } = tokens;

      await storageHelper.saveSession(accessToken, refreshToken, user);
      setUser(user);

      return { success: true };
    } catch (error) {
      console.log(error);

      const backendCode = error.response?.data?.code;
      const backendMessage =
        error.response?.data?.message?.toString?.().toLowerCase() || '';
      const backendStatus = error.response?.status;
      const isCredentialsError =
        [400, 401, 403, 404, 422].includes(backendStatus) ||
        /credencial|password|contraseña|correo|email|usuario|login|credentials|invalid/i.test(
          backendMessage
        );
      const errorCode =
        backendCode || (isCredentialsError ? 'INVALID_LOGIN' : null);

      return {
        success: false,
        message: getErrorMessage(errorCode),
        code: errorCode,
        status: backendStatus ?? null,
      };
    }
  };

  /**
   * Inicio de sesión de empleados (portero/staff). Usa el endpoint /auth/login/admin.
   * Persiste la sesión igual que el login de cliente; el `user` resultante trae roleCode.
   */
  const loginEmployee = async (credentials) => {
    try {
      const response = await authService.loginAdmin(credentials);

      if (!response?.success) {
        return {
          success: false,
          code: response?.code,
          message: getErrorMessage(response?.code),
        };
      }

      const { user, tokens } = response.data;
      const { accessToken, refreshToken } = tokens;

      // Guardamos primero para que el interceptor de `api` tenga el token,
      // luego pedimos los permisos y los fusionamos en el user.
      await storageHelper.saveSession(accessToken, refreshToken, user);

      let permissions = [];
      try {
        permissions = await authService.getPermissions();
      } catch {
        // Si falla, el user queda sin permisos y el gate lo bloquea (fail-safe).
      }

      const fullUser = { ...user, permissions };
      await storageHelper.saveSession(accessToken, refreshToken, fullUser);
      setUser(fullUser);

      return { success: true, user: fullUser };
    } catch (error) {
      const backendCode = error.response?.data?.code;
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
      return {
        success: true,
        message: response?.message || 'Registro exitoso.',
      };
    } catch (error) {
      console.error(' [Backend Register Error Request]:', error.config?.url);
      if (error.response) {
        console.error(
          ' [Backend Response Data]:',
          JSON.stringify(error.response.data, null, 2)
        );
        console.error(' [Backend Status Code]:', error.response.status);
      } else if (error.request) {
        console.error(' [No response received from Server]:', error.request);
      } else {
        console.error(' [Axios Setup Error]:', error.message);
      }

      return {
        success: false,
        // Extrae el mensaje específico de tu API (ej. "El correo ya está registrado")
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'No se pudo completar el registro.',
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
        const response = await authService.logout();
        if (response?.message) {
          console.log(response.message);
        }
      } catch (apiError) {
        console.warn(
          'El servidor no pudo procesar el logout o el token expiró:',
          apiError
        );
      }

      await storageHelper.clearSession();
      // Vaciar el carrito persistido para que no se arrastre entre sesiones
      await AsyncStorage.removeItem(CART_STORAGE_KEY).catch(() => {});

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
        message:
          error.response?.data?.message || 'Cuenta no verificada exitosamente.',
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
        message:
          error.response?.data?.message || 'Error al procesar la solicitud.',
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
        message: error.response?.data?.message || 'Código inválido o expirado.',
      };
    }
  };

  /**
   * RECUPERAR CONTRASEÑA - PASO 3 (Establecer nueva contraseña con el token de 64 caracteres)
   */
  const resetPassword = async ({ email, resetToken, newPassword }) => {
    try {
      const response = await authService.resetPassword({
        email,
        resetToken,
        newPassword,
      });
      return { success: true, message: response?.message };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'No se pudo restablecer la contraseña.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginEmployee,
        roleCode: user?.roleCode ?? null,
        register,
        logout,
        isAuthenticated: !!user && Object.keys(user).length > 0,
        verifyAccount,
        sendRecoveryEmail,
        verifyRecoveryCode,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
