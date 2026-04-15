import { Animated } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import LoginScreen from '../auth/LoginScreen';

// 1. MOCK DE NAVEGACIÓN (Expo Router)
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
  }),
}));

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

describe('LoginScreen Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar correctamente los elementos del formulario de inicio de sesión', () => {
    const { getByText, getByLabelText } = render(<LoginScreen />);

    expect(getByText('Inicio de Sesión')).toBeTruthy();
    expect(getByLabelText('Correo')).toBeTruthy();
    expect(getByLabelText('Contraseña')).toBeTruthy();
    expect(getByText('Ingresar')).toBeTruthy();
  });

  it('debe mostrar mensajes de error cuando los campos están vacíos al intentar ingresar', async () => {
    const { getByText, findByText } = render(<LoginScreen />);

    await act(async () => {
      fireEvent.press(getByText('Ingresar'));
    });

    // Buscamos los mensajes de error asíncronos generados por react-hook-form
    expect(await findByText('El correo es obligatorio')).toBeTruthy();
    expect(await findByText('LLenar campos faltantes')).toBeTruthy();
  });

  it('debe mostrar error de validación cuando el formato del correo es inválido', async () => {
    const { getByText, getByLabelText, findByText } = render(<LoginScreen />);

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
    const { getByText } = render(<LoginScreen />);

    const registerLink = getByText('Regístrate aquí');
    act(() => {
      fireEvent.press(registerLink);
    });

    expect(mockPush).toHaveBeenCalledWith('/register');
  });

  it('debe navegar a la pantalla de recuperación de contraseña', () => {
    const { getByText } = render(<LoginScreen />);

    const recoverLink = getByText('¿Olvidaste tu contraseña?');
    act(() => {
      fireEvent.press(recoverLink);
    });

    expect(mockPush).toHaveBeenCalledWith('/forgot-password');
  });

  it('debe permitir el inicio de sesión exitoso cuando los datos son válidos', async () => {
    const { getByText, getByLabelText, queryByText } = render(<LoginScreen />);
    const spyLog = jest.spyOn(console, 'log').mockImplementation();

    await act(async () => {
      fireEvent.changeText(getByLabelText('Correo'), 'alexis@ucla.edu.ve');
      fireEvent(getByLabelText('Correo'), 'blur');
      fireEvent.changeText(getByLabelText('Contraseña'), 'Password123');
      fireEvent(getByLabelText('Contraseña'), 'blur');
      fireEvent.press(getByText('Ingresar'));
    });

    // Verificamos que no existan errores de validación en pantalla tras el envío exitoso
    await waitFor(() => {
      expect(queryByText('El correo es obligatorio')).toBeNull();
      expect(queryByText('LLenar campos faltantes')).toBeNull();
    });

    expect(spyLog).toHaveBeenCalledWith(
      expect.stringContaining('Login intent'),
      'alexis@ucla.edu.ve'
    );
    spyLog.mockRestore();
  });
});
