import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useNavigation, useRouter } from 'expo-router';
import { AUTH_ERRORS } from '../../constants/errorMessages';
import { AuthProvider } from '../../context/AuthContext';
import { storageHelper } from '../../helper/storage.helper';
import { authService } from '../../services/auth.service';
import LoginScreen from '../auth/loginScreen';

jest.mock('../../services/auth.service');
jest.mock('../../helper/storage.helper');
jest.mock('expo-router');

const mockReplace = jest.fn();
useRouter.mockReturnValue({
  replace: mockReplace,
  push: jest.fn(),
  back: jest.fn(),
});
useNavigation.mockReturnValue({});

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
        tokens: {
          accessToken: 'fake-access-token',
          refreshToken: 'fake-refresh-token',
        },
      },
    });

    // 2. RENDERIZAR DESPUÉS
    const { findByLabelText, findByText } = renderWithAuth();

    const emailInput = await findByLabelText('Correo');
    const passwordInput = await findByLabelText('Contraseña');
    const submitButton = await findByText('Ingresar');

    // 3. SIMULAR EVENTOS
    fireEvent.changeText(emailInput, 'alexis@gmail.com');
    fireEvent.changeText(passwordInput, 'Password123!');
    fireEvent.press(submitButton);

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

    const { findByLabelText, findByText } = renderWithAuth();

    const emailInput = await findByLabelText('Correo');
    const passwordInput = await findByLabelText('Contraseña');
    const submitButton = await findByText('Ingresar');

    fireEvent.changeText(emailInput, 'pendiente@gmail.com');
    fireEvent.changeText(passwordInput, 'Password123!');

    // Eliminado el bloque act() redundante
    fireEvent.press(submitButton);

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

    const { findByLabelText, findByText } = renderWithAuth();

    const emailInput = await findByLabelText('Correo');
    const passwordInput = await findByLabelText('Contraseña');
    const submitButton = await findByText('Ingresar');

    fireEvent.changeText(emailInput, 'error@gmail.com');
    fireEvent.changeText(passwordInput, 'WrongPassword1*');

    fireEvent.press(submitButton);

    // findByText ya maneja internamente el asincronismo (hace un waitFor encubierto)
    expect(await findByText(AUTH_ERRORS.INVALID_LOGIN)).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
