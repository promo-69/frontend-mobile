import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { AUTH_ERRORS } from '../../constants/errorMessages';
import { AuthProvider } from '../../context/AuthContext';
import { storageHelper } from '../../helper/storage.helper';
import { authService } from '../../services/auth.service';
import LoginScreen from '../auth/loginScreen';

jest.mock('../../services/auth.service');
jest.mock('../../helper/storage.helper');

const mockReplace = jest.fn();
useRouter.mockReturnValue({
  replace: mockReplace,
  push: jest.fn(),
  back: jest.fn(),
});

describe('LoginScreen Integration Tests', () => {
  let consoleSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    // Silencia console.log y console.error para mantener limpia la terminal
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  const renderWithAuth = () => {
    return render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );
  };

  it('Flujo Normal: debe iniciar sesión exitosamente y navegar al home', async () => {
    // 1. CONFIGURAR MOCK PRIMERO
    authService.login.mockResolvedValueOnce({
      success: true,
      data: {
        user: { id: 1, firstName: 'Alexis', email: 'alexis@gmail.com' },
        tokens: { accessToken: 'fake-access-token', refreshToken: 'fake-refresh-token' }
      }
    });

    // 2. RENDERIZAR DESPUÉS
    const { getByLabelText, getByText } = renderWithAuth();

    // 3. SIMULAR EVENTOS
    fireEvent.changeText(getByLabelText('Correo'), 'alexis@gmail.com');
    fireEvent.changeText(getByLabelText('Contraseña'), 'Password123!');
    fireEvent.press(getByText('Ingresar'));

    // 4. ASERCIONES ASÍNCRONAS
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'alexis@gmail.com',
        password: 'Password123!',
      });
      expect(storageHelper.saveSession).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/(main)/home');
    });
  });

  it('Caso Alterno: debe redirigir a verificación si la cuenta no está verificada', async () => {
    const unverifiedError = {
      response: {
        status: 401,
        data: {
          code: 'UNVERIFIED_ACCOUNT',
          message: 'Tu cuenta aún no ha sido verificada',
        },
      },
    };
    // Configurar mock antes del render
    authService.login.mockRejectedValueOnce(unverifiedError);

    const { getByLabelText, getByText } = renderWithAuth();

    fireEvent.changeText(getByLabelText('Correo'), 'pendiente@gmail.com');
    fireEvent.changeText(getByLabelText('Contraseña'), 'Password123!');
    
    // Eliminado el bloque act() redundante
    fireEvent.press(getByText('Ingresar'));

    // El waitFor se asegura de aguardar la respuesta asíncrona del Contexto
    await waitFor(() => {
      expect(storageHelper.saveValue).toHaveBeenCalledWith(
        'user_email_to_verify',
        'pendiente@gmail.com'
      );
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/register-verify');
    });
  });

  it('Caso de Error: debe mostrar mensaje de error en pantalla ante credenciales inválidas', async () => {
    const invalidLoginError = {
      response: {
        status: 401,
        data: {
          code: 'INVALID_LOGIN',
          message: 'Correo o contraseña incorrectos.',
        },
      },
    };
    // Corregido a mockRejectedValueOnce para que caiga en el catch real de tu código
    authService.login.mockRejectedValueOnce(invalidLoginError);

    const { getByLabelText, getByText, findByText } = renderWithAuth();

    fireEvent.changeText(getByLabelText('Correo'), 'error@gmail.com');
    fireEvent.changeText(getByLabelText('Contraseña'), 'WrongPassword1*');
    
    fireEvent.press(getByText('Ingresar'));

    // findByText ya maneja internamente el asincronismo (hace un waitFor encubierto)
    expect(await findByText(AUTH_ERRORS.INVALID_LOGIN)).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});