import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AuthProvider } from '../../context/AuthContext';
import { storageHelper } from '../../helper/storage.helper';
import { jwtHelper } from '../../helper/jwt.helper';
import { authService } from '../../services/auth.service';
import EmailCheck from '../auth/emailCheck';

// Mocks de servicios y helpers
jest.mock('../../services/auth.service');
jest.mock('../../helper/storage.helper');
jest.mock('../../helper/jwt.helper');

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
    jwtHelper.isExpired.mockReturnValue(false);
    jest.useRealTimers(); // Usamos tiempo real para evitar bloqueos
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('debe cargar el correo desde el almacenamiento y mostrarlo en el subtítulo', async () => {
    storageHelper.getValue.mockResolvedValue('alexis@ucla.edu.ve');
    const { findByText } = renderWithAuth();

    const emailText = await findByText('alexis@ucla.edu.ve');
    expect(emailText).toBeTruthy();
  });

  it('debe alertar y redirigir al registro si no se encuentra un correo en el storage', async () => {
    storageHelper.getValue.mockResolvedValue(null);
    renderWithAuth();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Aviso',
        'No se encontró un correo pendiente de verificación.'
      );
      expect(mockReplace).toHaveBeenCalledWith('/register');
    });
  });

  it('debe realizar la verificación exitosa, mostrar SuccessScreen y redirigir', async () => {
    storageHelper.getValue.mockResolvedValue('alexis@ucla.edu.ve');
    authService.verifyEmail.mockResolvedValue({ success: true });

    const { findByTestId, getByText } = renderWithAuth();

    const input = await findByTestId('otp-input-hidden');

    await act(async () => {
      fireEvent.changeText(input, '1234');
    });

    // Verificamos que se cumpla la lógica de éxito y la UI responda correctamente
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

    // Omitimos el avance manual de los timers falsos para evitar fugas de memoria,
    // y simplemente esperamos de forma asíncrona limpia a que el router sea invocado.
    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith('/login');
      },
      { timeout: 3500 }
    ); // Le damos el margen de los 3 segundos que tarda tu pantalla
  });

  it('debe mostrar alerta de error y limpiar los inputs si la verificación falla', async () => {
    storageHelper.getValue.mockResolvedValue('alexis@ucla.edu.ve');
    authService.verifyEmail.mockRejectedValue({
      response: { data: { message: 'Código inválido' } },
    });

    const { findByTestId } = renderWithAuth();
    const input = await findByTestId('otp-input-hidden');

    await act(async () => {
      fireEvent.changeText(input, '0000');
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Verificación fallida',
        'Código inválido'
      );
      expect(input.props.value).toBe('');
    });
  });
});
