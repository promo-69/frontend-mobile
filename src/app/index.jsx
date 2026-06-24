import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { isLoading } = useAuth();

  // No renderizar nada mientras se verifica la sesión en el almacenamiento
  if (isLoading) return null;

  // Enviamos al usuario al Home por defecto
  return <Redirect href="/(main)/home" />;
}
