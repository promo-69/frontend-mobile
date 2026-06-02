import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import EmailCheck from '../auth/emailCheck';
import { AuthProvider } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import { storageHelper } from '../../helper/storage.helper';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

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
        "Aviso",
        "No se encontró un correo pendiente de verificación."
      );
      expect(mockReplace).toHaveBeenCalledWith('/register');
    });
  });

  it('debe realizar la verificación exitosa, mostrar SuccessScreen y redirigir tras 3 segundos', async () => {
    storageHelper.getValue.mockResolvedValueOnce('alexis@ucla.edu.ve');
    authService.verifyEmail.mockResolvedValueOnce({ success: true });

    const { getAllByRole, getByText } = renderWithAuth();

    const inputs = await waitFor(() => getAllByRole('textinput'));
    
    // Simulamos la entrada de los 4 dígitos
    await act(async () => {
      fireEvent.changeText(inputs[0], '1');
      fireEvent.changeText(inputs[1], '2');
      fireEvent.changeText(inputs[2], '3');
      fireEvent.changeText(inputs[3], '4'); // Al completar el 4to, handleContinue se dispara
    });

    await waitFor(() => {
      expect(authService.verifyEmail).toHaveBeenCalledWith({
        email: 'alexis@ucla.edu.ve',
        code: '1234'
      });
      expect(storageHelper.removeValue).toHaveBeenCalledWith('user_email_to_verify');
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
      response: { data: { message: 'Código inválido' } }
    });

    const { getAllByRole } = renderWithAuth();
    const inputs = await waitFor(() => getAllByRole('textinput'));

    await act(async () => {
      fireEvent.changeText(inputs[0], '0');
      fireEvent.changeText(inputs[1], '0');
      fireEvent.changeText(inputs[2], '0');
      fireEvent.changeText(inputs[3], '0');
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Verificación fallida", "Código inválido");
      // Verificamos que los inputs se hayan reseteado a vacío
      inputs.forEach(input => expect(input.props.value).toBe(''));
    });
  });

  it('debe reenviar el código al presionar el botón "Reenviar código"', async () => {
    const testEmail = 'alexis@ucla.edu.ve';
    storageHelper.getValue.mockResolvedValueOnce(testEmail);
    authService.sendRecoveryEmailRequest.mockResolvedValueOnce({ success: true, message: 'Correo de recuperación enviado' });

    const { getByTestId } = renderWithAuth();

    // Esperamos a que el email se cargue y el botón esté disponible
    const resendButton = await waitFor(() => getByTestId('resend-code-button'));

    await act(async () => {
      fireEvent.press(resendButton);
    });

    // Verificamos que el servicio de reenvío fue llamado con el email correcto
    expect(authService.sendRecoveryEmailRequest).toHaveBeenCalledWith(testEmail);

    // Verificamos que se mostró la alerta de éxito
    expect(Alert.alert).toHaveBeenCalledWith(
      "Éxito",
      "Se ha reenviado el código a tu correo."
    );
  });
});
