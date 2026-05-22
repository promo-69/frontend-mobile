import { Home, PopcornIcon, Ticket, MapPin, Store, User, ShoppingCart } from 'lucide-react-native'
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants';

export default function MainLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.itemActive,
        tabBarInactiveTintColor: theme.colors.itemInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.bgHeader,
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
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
        name="purchases"
        options={{
          title: 'Compras',
          tabBarIcon: ({ color }) => <ShoppingCart color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="cinemas"
        options={{
          title: 'Cines',
          tabBarIcon: ({ color }) => < Store color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
