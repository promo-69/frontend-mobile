import { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { storageHelper } from '../helper/storage.helper';
import { authService } from '../services/auth.service';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    const storedUser = await storageHelper.getUser();
    const token = await storageHelper.getToken();
    if (storedUser && token) {
      setUser(storedUser);
    }
    setIsLoading(false);
  };

  const login = async (credentials) => {
    try {
      const { token, user: userData } =
        await authService.loginRequest(credentials);
      await storageHelper.saveSession(token, userData);
      setUser(userData);
    } catch (error) {
      // Lógica de Bypass para desarrollo sin Backend
      if (__DEV__) {
        console.warn('Backend no disponible. Entrando en modo de prueba.');
        const mockUser = {
          firstName: 'Usuario',
          lastName: 'Developer',
          email: credentials.email,
          phoneNumber: '04121234567'
        };
        setUser(mockUser);
        return;
      }

      Alert.alert('Error', error.response?.data?.message || 'Error de conexión');
      throw error;
    }
  };

  const register = async (data) => {
    try {
      await authService.registerRequest(data);
      Alert.alert('Éxito', 'Registro completado. Ahora puedes iniciar sesión.');
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Error en el registro'
      );
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logoutRequest();
    } finally {
      await storageHelper.clearSession();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
