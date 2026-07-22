import {
  Home,
  PopcornIcon,
  Ticket,
  MapPin,
  Store,
  User,
  ShoppingCart,
  Gift,
} from 'lucide-react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants';
import { useAuth } from '../../context/AuthContext';

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.itemActive,
        tabBarInactiveTintColor: theme.colors.itemInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.background.accent,
          borderTopWidth: 1,
          borderTopColor: theme.colors.primary,
          height: 65 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 10,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.variants.label,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="concessions"
        options={{
          title: 'Tienda',
          tabBarIcon: ({ color }) => <PopcornIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Premios',
          tabBarIcon: ({ color }) => <Gift color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="purchases"
        options={{
          title: 'Mis Compras',
          tabBarIcon: ({ color }) => <ShoppingCart color={color} size={24} />,
          // Solo para usuarios autenticados: href null quita la tab del tab bar
          // y desactiva la navegación a la ruta
          href: isAuthenticated ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
          href: isAuthenticated ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="cinemas"
        options={{
          title: 'Cines',
          tabBarIcon: ({ color }) => <MapPin color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
