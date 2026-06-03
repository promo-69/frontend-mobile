import { Animated } from 'react-native';
import { act, fireEvent, render, waitFor, queryByText } from '@testing-library/react-native';
import LoginScreen from '../auth/LoginScreen';
import { AuthProvider } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import { storageHelper } from '../../helper/storage.helper';
import { jwtHelper } from '../../helper/jwt.helper';

// Mock de servicios y helpers
jest.mock('../../services/auth.service');
jest.mock('../../helper/storage.helper');
jest.mock('../../helper/jwt.helper');

// 1. MOCK DE NAVEGACIÓN (Expo Router)
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => {
  return {
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      back: mockBack,
    }),
    useNavigation: () => ({
      canGoBack: jest.fn(() => true),
      goBack: mockBack,
    }),
  };
});

// Mock para que las animaciones sean instantáneas y evitar warnings de act(...)
jest.spyOn(Animated, 'timing').mockImplementation(() => ({
  start: (callback) => callback && callback({ finished: true }),
  stop: () => {},
}));

// 2. MOCK DE GRADIENTE (Expo)
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }) => children,
}));

// 3. MOCK DE SAFE AREA (Evita warnings de insets)
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
}));

// 4. MOCK DE COMPONENTES UI (Opcional, para simplificar el árbol)
jest.mock('../../components/ui/Icons/Logo', () => 'Logo');

// Helper para renderizar con el contexto de autenticación
const renderWithAuth = (ui) => {
  return render(<AuthProvider>{ui}</AuthProvider>);
};

describe('LoginScreen Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Configuramos los mocks para que el AuthContext no intente cerrar sesión al iniciar
    jwtHelper.isExpired.mockReturnValue(false);
    storageHelper.getUserData.mockResolvedValue(null);
    storageHelper.getAccessToken.mockResolvedValue(null);
    
    // Simulamos respuesta de login por defecto
    authService.login.mockResolvedValue({
      success: true,
      data: { user: {}, tokens: {} },
    });
  });

  it('debe renderizar correctamente los elementos del formulario de inicio de sesión', () => {
    const { getByText, getByLabelText } = renderWithAuth(<LoginScreen />);

    expect(getByText('Inicio de Sesión')).toBeTruthy();
    expect(getByLabelText('Correo')).toBeTruthy();
    expect(getByLabelText('Contraseña')).toBeTruthy();
    expect(getByText('Ingresar')).toBeTruthy();
  });

  it('debe mostrar mensajes de error cuando los campos están vacíos al intentar ingresar', async () => {
    const { getByText, findByText } = renderWithAuth(<LoginScreen />);

    await act(async () => {
      fireEvent.press(getByText('Ingresar'));
    });

    // Verificamos que aparezcan los errores de validación de react-hook-form
    expect(await findByText('El correo es obligatorio')).toBeTruthy();
    expect(await findByText('La contraseña es obligatoria')).toBeTruthy();
  });

  it('debe mostrar error de validación cuando el formato del correo es inválido', async () => {
    const { getByText, getByLabelText, findByText } = renderWithAuth(
      <LoginScreen />
    );

    await act(async () => {
      fireEvent.changeText(getByLabelText('Correo'), 'usuario_invalido');
      fireEvent(getByLabelText('Correo'), 'blur');
      fireEvent.press(getByText('Ingresar'));
    });

    expect(
      await findByText('Formato de correo electrónico inválido')
    ).toBeTruthy();
  });

  it('debe navegar a la pantalla de registro al presionar el link correspondiente', () => {
    const { getByText } = renderWithAuth(<LoginScreen />);

    const registerLink = getByText('Regístrate aquí');
    act(() => {
      fireEvent.press(registerLink);
    });

    expect(mockPush).toHaveBeenCalledWith('/register');
  });

  it('debe navegar a la pantalla de recuperación de contraseña', () => {
    const { getByText } = renderWithAuth(<LoginScreen />);

    const recoverLink = getByText('¿Olvidaste tu contraseña?');
    act(() => {
      fireEvent.press(recoverLink);
    });

    expect(mockPush).toHaveBeenCalledWith('/forgot-password');
  });

  it('debe permitir el inicio de sesión exitoso cuando los datos son válidos', async () => {
    const { getByText, getByLabelText, queryByText } = renderWithAuth(
      <LoginScreen />
    );

    // Esperamos a que la carga inicial de AuthProvider finalice
    await waitFor(() => expect(getByText('Ingresar')).toBeTruthy());

    fireEvent.changeText(getByLabelText('Correo'), 'alexis@ucla.edu.ve');
    fireEvent.changeText(getByLabelText('Contraseña'), 'Password123');
    fireEvent(getByLabelText('Correo'), 'blur');
    fireEvent(getByLabelText('Contraseña'), 'blur');
    fireEvent.press(getByText('Ingresar'));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'alexis@ucla.edu.ve',
        password: 'Password123',
      });
    });

    expect(storageHelper.saveSession).toHaveBeenCalled();
  });
});
