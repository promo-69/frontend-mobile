import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { SuccessScreen } from '../../shared/SuccessScreen';

export default function RecoverPasswordScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <SuccessScreen
        title="¡Todo listo!"
        message="Tu contraseña ha sido actualizada"
        buttonText="Cerrar"
        onPress={() => router.replace('/login')}
      />
    </ScreenWrapper>
  );
}
