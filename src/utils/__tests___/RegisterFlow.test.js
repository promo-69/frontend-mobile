import { act, fireEvent, render } from '@testing-library/react-native';
import RegisterScreen from '../../screens/auth/RegisterScreen'; // Ajusta la ruta según tu estructura

// 1. MOCK DE NAVEGACIÓN (Expo Router)
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
  }),
}));

// 2. MOCKS DE COMPONENTES DE UI
// Al no haber NativeWind, un mock simple con testID es suficiente
jest.mock('../../components/ui/DateInput', () => ({
  DateInput: ({ label, ...props }) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="mock-date-input" {...props}>
        <Text>{label}</Text>
      </View>
    );
  },
}));

jest.mock('../../components/ui/SelectorInput', () => ({
  SelectorInput: ({ label, ...props }) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="mock-selector-input" {...props}>
        <Text>{label}</Text>
      </View>
    );
  },
}));

// 3. MOCK DE SAFE AREA (Recomendado para evitar warnings de insets)
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
}));

describe('Registro - Integración Paso 1 (Validación Explícita)', () => {
  it('debe mostrar errores y bloquear el avance si los campos están vacíos', async () => {
    const { getByText, findByText, queryByText } = render(<RegisterScreen />);

    // 1. Localizamos el botón "Continuar" (que ahora está habilitado)
    const continueButton = getByText('Continuar');

    // 2. Simulamos clic sin haber llenado nada
    fireEvent.press(continueButton);

    // 3. Verificamos que aparezcan los mensajes de error definidos en PersonalInfoSteps
    expect(await findByText('Los nombres son obligatorios')).toBeTruthy();
    expect(await findByText('Los apellidos son obligatorios')).toBeTruthy();
    expect(await findByText('El correo es obligatorio')).toBeTruthy();

    // 4. Verificamos que NO avanzamos al Paso 2 (el subtítulo del Paso 1 sigue ahí)
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
    fireEvent.changeText(getByLabelText('Nombres'), 'Alexis');
    fireEvent.changeText(getByLabelText('Apellidos'), 'Mendoza');
    fireEvent.changeText(
      getByLabelText('Correo Electrónico'),
      'alexis@ucla.edu.ve'
    );
    fireEvent.changeText(getByLabelText('Teléfono'), '04121234567');

    // Verificamos que el texto descriptivo del Paso 1 ya NO esté en pantalla
    await act(async () => {
      fireEvent.press(getByText('Continuar'));
    });

    // Verificamos que ahora aparezca un elemento del Paso 2 (ej. el label de Cédula)
    // findByText ya maneja la espera asíncrona del cambio de estado
    const cedulaLabel = await findByText('Cédula de Identidad');
    expect(cedulaLabel).toBeTruthy();

    // Verificamos que el contenido del paso 1 haya desaparecido
    expect(queryByText(subtituloPaso1)).toBeNull();
  });
});
