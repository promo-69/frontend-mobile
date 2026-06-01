import { act, fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { AuthProvider } from '../../context/AuthContext';
import { storageHelper } from '../../helper/storage.helper';
import { authService } from '../../services/auth.service';
import LoginScreen from '../auth/loginScreen';

// Indicamos a Jest que utilice los "Manual Mocks" que definimos anteriormente
jest.mock('../../services/auth.service');
jest.mock('../../helper/storage.helper');

// Obtenemos el mock de useRouter definido en jest.setup.js para observar sus llamadas
const mockReplace = jest.fn();
useRouter.mockReturnValue({
  replace: mockReplace,
  push: jest.fn(),
  back: jest.fn(),
});

describe('LoginScreen Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper para renderizar la pantalla envuelta en su proveedor de contexto
  const renderWithAuth = () => {
    return render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );
  };

  it('Flujo Normal: debe iniciar sesión exitosamente y navegar al home', async () => {
    const { getByLabelText, getByText } = renderWithAuth();

    // 1. Simular entrada de datos del usuario
    fireEvent.changeText(getByLabelText('Correo'), 'alexis@gmail.com');
    fireEvent.changeText(getByLabelText('Contraseña'), 'Password123!');

    // 2. Ejecutar el login
    await act(async () => {
      fireEvent.press(getByText('Ingresar'));
    });

    // 3. Aserciones de integración
    // Verificamos que se llamó al servicio con las credenciales limpias
    expect(authService.login).toHaveBeenCalledWith({
      email: 'alexis@gmail.com',
      password: 'Password123!',
    });

    // Verificamos que el Contexto orquestó el guardado de la sesión
    expect(storageHelper.saveSession).toHaveBeenCalled();

    // Verificamos que la pantalla redirigió al usuario al Home
    expect(mockReplace).toHaveBeenCalledWith('/(main)/home');
  });

  it('Caso Alterno: debe redirigir a verificación si la cuenta no está verificada', async () => {
    // Configuramos el mock para que falle con el código específico del backend
    const unverifiedError = {
      response: {
        data: {
          code: 'UNVERIFIED_ACCOUNT',
          message: 'Tu cuenta aún no ha sido verificada',
        },
      },
    };
    authService.login.mockRejectedValueOnce(unverifiedError);

    const { getByLabelText, getByText } = renderWithAuth();

    fireEvent.changeText(getByLabelText('Correo'), 'pendiente@gmail.com');
    fireEvent.changeText(getByLabelText('Contraseña'), 'Password123!');

    await act(async () => {
      fireEvent.press(getByText('Ingresar'));
    });

    // Verificamos que la pantalla persistió el email para el flujo de verificación
    expect(storageHelper.saveValue).toHaveBeenCalledWith(
      'user_email_to_verify',
      'pendiente@gmail.com'
    );

    // Verificamos la navegación forzada al componente de código de verificación
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/register-verify');
  });

  it('Caso de Error: debe mostrar mensaje de error en pantalla ante credenciales inválidas', async () => {
    // Simulamos una respuesta de error común (401)
    authService.login.mockResolvedValueOnce({
      success: false,
      message: 'Credenciales inválidas',
      code: 'INVALID_LOGIN',
    });

    const { getByLabelText, getByText, findByText } = renderWithAuth();

    fireEvent.changeText(getByLabelText('Correo'), 'error@gmail.com');
    fireEvent.changeText(getByLabelText('Contraseña'), 'WrongPassword');

    await act(async () => {
      fireEvent.press(getByText('Ingresar'));
    });

    // Verificamos que el mensaje de error se renderiza en el contenedor visual
    expect(await findByText('Credenciales inválidas')).toBeTruthy();

    // Aseguramos que el router NO se movió de la pantalla actual
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
