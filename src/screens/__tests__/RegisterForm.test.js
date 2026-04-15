import {
    act,
    fireEvent,
    render,
    waitFor
} from '@testing-library/react-native';
import { Animated } from 'react-native';
import RegisterScreen from '../auth/RegisterScreen'; // Ajusta la ruta según tu estructura

// MOCK DE NAVEGACIÓN (Expo Router)
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

//MOCKS DE COMPONENTES DE UI
jest.mock('../../components/ui/DateInput', () => ({
  DateInput: ({ label, error, ...props }) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="mock-date-input" accessibilityLabel={label} {...props}>
        <Text>{label}</Text>
        {error && <Text>{error}</Text>}
      </View>
    );
  },
}));

jest.mock('../../components/ui/SelectorInput', () => ({
  SelectorInput: ({ label, error, ...props }) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="mock-selector-input" accessibilityLabel={label} {...props}>
        <Text>{label}</Text>
        {error && <Text>{error}</Text>}
      </View>
    );
  },
}));

//MOCK DE SAFE AREA (para evitar warnings de insets)
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
}));

describe('Registro - Integración Paso 1 (Validación Explícita)', () => {
  it('debe mostrar errores y bloquear el avance si los campos están vacíos', async () => {
    const { getByText, findByText, queryByText } = render(<RegisterScreen />);

    // Localizamos el botón "Continuar"
    const continueButton = getByText('Continuar');

    //Simulamos clic sin haber llenado nada
    await act(async () => {
      fireEvent.press(continueButton);
    });

    //Verificamos que aparezcan los mensajes de error definidos en PersonalInfoSteps
    expect(await findByText('Los nombres son obligatorios')).toBeTruthy();
    expect(await findByText('Los apellidos son obligatorios')).toBeTruthy();
    expect(await findByText('El correo es obligatorio')).toBeTruthy();

    //Verificamos que NO avanzamos al Paso 2 (el subtítulo del Paso 1 sigue ahí)
    expect(
      getByText(
        'Ingresa tus datos básicos para comenzar tu experiencia en Cineflix.'
      )
    ).toBeTruthy();
  });

  it('debe avanzar al Paso 2 cuando los datos son válidos tras un intento fallido', async () => {
    const { getByText, getByLabelText, queryByText, findByText } = render(
      <RegisterScreen />
    );

    const subtituloPaso1 =
      'Ingresa tus datos básicos para comenzar tu experiencia en Cineflix.';

    // Llenamos datos válidos en los campos del Paso 1
    await act(async () => {
      fireEvent.changeText(getByLabelText('Nombres'), 'Alexis');
      fireEvent.changeText(getByLabelText('Apellidos'), 'Mendoza');
      fireEvent.changeText(
        getByLabelText('Correo Electrónico'),
        'alexis@ucla.edu.ve'
      );
      fireEvent.changeText(getByLabelText('Teléfono'), '04121234567');
    });

    // Verificamos que el texto descriptivo del Paso 1 ya no esté en pantalla
    await act(async () => {
      fireEvent.press(getByText('Continuar'));
    });

    // Verificamos que ahora aparezca un elemento del Paso 2
    // findByText ya maneja la espera asíncrona del cambio de estado
    const cedulaLabel = await findByText('Cédula de Identidad');
    expect(cedulaLabel).toBeTruthy();

    // Verificamos que el contenido del paso 1 haya desaparecido
    expect(queryByText(subtituloPaso1)).toBeNull();
  });

  it('debe validar errores en el Paso 2 y luego avanzar al Paso 3', async () => {
    const { getByText, getByLabelText, findByText, getByTestId, queryByText } =
      render(<RegisterScreen />);

    //COMPLETAR PASO 1
    await act(async () => {
      fireEvent.changeText(getByLabelText('Nombres'), 'Alexis');
      fireEvent.changeText(getByLabelText('Apellidos'), 'Mendoza');
      fireEvent.changeText(
        getByLabelText('Correo Electrónico'),
        'alexis@gmail.com'
      );
      fireEvent.changeText(getByLabelText('Teléfono'), '04121234567');
    });

    await act(async () => {
      fireEvent.press(getByText('Continuar'));
    });

    // --- VALIDACIÓN DE ERRORES PASO 2 ---
    // Verificamos que estamos en el Paso 2
    expect(await findByText('Cédula de Identidad')).toBeTruthy();

    // Intentamos continuar sin llenar el paso 2
    await act(async () => {
      fireEvent.press(getByText('Continuar'));
    });

    // Verificamos mensajes de error esperados del Paso 2
    expect(await findByText('La cédula es requerida')).toBeTruthy();
    expect(await findByText('La fecha es requerida')).toBeTruthy();
    expect(await findByText('El género es obligatorio')).toBeTruthy();
    expect(await findByText('La contraseña es requerida')).toBeTruthy();
    expect(
      await findByText('Debes aceptar los términos y condiciones')
    ).toBeTruthy();

    // --- COMPLETAR PASO 2 VÁLIDO ---
    await act(async () => {
      fireEvent.changeText(getByLabelText('Cédula de Identidad'), '12345678');

      // Simulamos la selección de fecha en el componente mockeado
      fireEvent(getByTestId('mock-date-input'), 'onChange', '20/05/1995');
      // Gatillamos blur en la fecha para limpiar el error (si tu mode es onBlur)
      fireEvent(getByTestId('mock-date-input'), 'blur');
    });
    // Verificación rápida: El error de fecha debería desaparecer
    await waitFor(() => {
      expect(queryByText('La fecha es requerida')).toBeNull();
    });

    // Seleccionamos Género
    await act(async () => {
      fireEvent.press(getByTestId('gender-dropdown-trigger'));
    });
    await act(async () => {
      fireEvent.press(getByTestId('gender-option-Masculino'));
      fireEvent(getByTestId('gender-dropdown-trigger'), 'blur');
    });
    await waitFor(() => {
      expect(queryByText('El género es obligatorio')).toBeNull();
    });

    await act(async () => {
      fireEvent.changeText(getByLabelText('Contraseña'), 'Password123!');
      fireEvent.changeText(
        getByLabelText('Confirmar contraseña'),
        'Password123!'
      );

      // Aceptar términos
      fireEvent.press(getByText(/Acepto los/));
    });

    await act(async () => {
      fireEvent.press(getByText('Continuar'));
    });

    // --- VERIFICAR PASO 3 ---
    // Si llegamos al paso 3, el botón cambia su texto a Finalizar
    expect(await findByText('Finalizar')).toBeTruthy();
  });

  it('debe desaparecer el mensaje de error inmediatamente cuando el usuario empieza a escribir un valor válido', async () => {
    const { getByText, getByLabelText, findByText, queryByText } = render(
      <RegisterScreen />
    );

    //Provocar el error intentando avanzar
    await act(async () => {
      fireEvent.press(getByText('Continuar'));
    });

    // Verificar que el error existe
    expect(await findByText('Los nombres son obligatorios')).toBeTruthy();

    // Escribir un valor válido y gatillar el blur
    // Como el modo es onBlur, necesitamos el evento blur para que RHF limpie el error
    await act(async () => {
      fireEvent.changeText(getByLabelText('Nombres'), 'Alexis');
      fireEvent(getByLabelText('Nombres'), 'blur');
    });

    // Verificar que el error ya no está en la pantalla
    // Usamos waitFor con toBeNull porque si el act anterior ya eliminó el elemento
    // waitForElementToBeRemoved lanzaría un error al no encontrarlo desde el inicio
    await waitFor(() => {
      expect(queryByText('Los nombres son obligatorios')).toBeNull();
    });
  });
});
