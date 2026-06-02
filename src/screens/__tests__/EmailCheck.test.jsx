import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AuthProvider } from '../../context/AuthContext';
import { storageHelper } from '../../helper/storage.helper';
import { authService } from '../../services/auth.service';
import EmailCheck from '../auth/emailCheck';

// Mocks de servicios y helpers
jest.mock('../../services/auth.service');
jest.mock('../../helper/storage.helper');

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// Espiamos el Alert para verificar mensajes al usuario
jest.spyOn(Alert, 'alert');

const renderWithAuth = () => {
  return render(
    <AuthProvider>
      <EmailCheck />
    </AuthProvider>
  );
};

describe('EmailCheck Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debe cargar el correo desde el almacenamiento y mostrarlo en el subtítulo', async () => {
    storageHelper.getValue.mockResolvedValueOnce('alexis@ucla.edu.ve');
    const { getByText } = renderWithAuth();

    await waitFor(() => {
      expect(getByText('alexis@ucla.edu.ve')).toBeTruthy();
    });
  });

  it('debe alertar y redirigir al registro si no se encuentra un correo en el storage', async () => {
    storageHelper.getValue.mockResolvedValueOnce(null);
    renderWithAuth();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Aviso',
        'No se encontró un correo pendiente de verificación.'
      );
      expect(mockReplace).toHaveBeenCalledWith('/register');
    });
  });

  it('debe realizar la verificación exitosa, mostrar SuccessScreen y redirigir tras 3 segundos', async () => {
    storageHelper.getValue.mockResolvedValueOnce('alexis@ucla.edu.ve');
    authService.verifyEmail.mockResolvedValueOnce({ success: true });

    const { getByTestId, getByText } = renderWithAuth();

    const input = await waitFor(() => getByTestId('otp-input-hidden'));

    await act(async () => {
      fireEvent.changeText(input, '1234');
    });

    await waitFor(() => {
      expect(authService.verifyEmail).toHaveBeenCalledWith({
        email: 'alexis@ucla.edu.ve',
        code: '1234',
      });
      expect(storageHelper.removeValue).toHaveBeenCalledWith(
        'user_email_to_verify'
      );
      expect(getByText('¡Cuenta Verificada!')).toBeTruthy();
    });

    // Avanzamos los timers para verificar la redirección automática
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('debe mostrar alerta de error y limpiar los inputs si la verificación falla', async () => {
    storageHelper.getValue.mockResolvedValueOnce('alexis@ucla.edu.ve');
    authService.verifyEmail.mockRejectedValueOnce({
      response: { data: { message: 'Código inválido' } },
    });

    const { getByTestId } = renderWithAuth();
    const input = await waitFor(() => getByTestId('otp-input-hidden'));

    await act(async () => {
      fireEvent.changeText(input, '0000');
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Verificación fallida',
        'Código inválido'
      );
      // Verificamos que el input se haya reseteado a vacío
      expect(input.props.value).toBe('');
    });
  });

  /*it('debe reenviar el código al presionar el botón "Reenviar código"', async () => {
    const testEmail = 'alexis@ucla.edu.ve';
    storageHelper.getValue.mockResolvedValueOnce(testEmail);
    authService.verifyEmail.mockResolvedValueOnce({
      success: true,
      message: 'Correo de recuperación enviado',
    });

    const { getByTestId } = renderWithAuth();

    // Esperamos a que el email se cargue y el botón esté disponible
    const resendButton = await waitFor(() => getByTestId('resend-code-button'));

    await act(async () => {
      fireEvent.press(resendButton);
    });

    // Verificamos que el servicio de reenvío fue llamado con el email correcto
    expect(authService.verifyEmail).toHaveBeenCalledWith(
      testEmail
    );

    // Verificamos que se mostró la alerta de éxito
    expect(Alert.alert).toHaveBeenCalledWith(
      'Éxito',
      'Se ha reenviado el código a tu correo.'
    );
  });*/
});
