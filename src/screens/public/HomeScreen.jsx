import { useRouter } from 'expo-router';
import { UserCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../assets/images/logo-cineflix-2.png';
import MovieCarousel from '../../components/home/MovieCarousel';
import MainCarousel from '../../components/home/MainCarousel';
import ForYouSection from '../../components/home/ForYouSection';
import { theme } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { getEvents } from '../../services/events.service';
import {
  getMoviesBillboard,
  getUpcomingMovies,
} from '../../services/movies.service';
import ChatAssistant from '../../components/assistant/ChatAssistant';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [releases, setReleases] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHome = async () => {
      try {
        setLoading(true);
        const [releasesData, upcomingData, eventsData] = await Promise.all([
          getMoviesBillboard(),
          getUpcomingMovies(),
          getEvents(),
        ]);

        // Los servicios ya devuelven los arrays normalizados
        setReleases(releasesData);
        setUpcoming(upcomingData);
        setEvents(eventsData);
      } catch (error) {
        console.error('Error crítico cargando la data del Home:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadHome();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background.accent}
        translucent={false}
      />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={Logo}
          style={styles.logo}
          contentFit="fill"
        />

        {/* Botón Ingresar */}
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.colors.accent} />
        ) : isAuthenticated ? (
          <TouchableOpacity
            style={styles.userProfileHeader}
            onPress={() => router.push('/(main)/profile')}
          >
            <View style={styles.userInfoText}>
              <Text style={styles.welcomeLabel}>¡Hola</Text>
              <Text style={styles.userNameText}>
                {user?.firstName
                  ? `${user.firstName.split(' ')[0]}!`
                  : '¡Usuario!'}
              </Text>
            </View>
            <View style={styles.avatarMini}>
              <UserCircle size={20} color={theme.colors.background.accent} />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>Ingresar</Text>
            <UserCircle size={18} color={theme.colors.background.accent} />
          </TouchableOpacity>
        )}
      </View>

      {/* Contenido Principal */}
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <MainCarousel/>

        <ForYouSection/>

        <MovieCarousel
          title="En Cartelera"
          movies={releases}
          loading={loading}
          onSeeMore={() => router.push('/home/releases')}
          onCardPress={(movie) =>
            router.push(`/content/${movie.id}?type=${movie.contentType}`)
          }
        />

        <MovieCarousel
          title="Próximos Estrenos"
          movies={upcoming}
          loading={loading}
          onSeeMore={() => router.push('/home/upcoming')}
          onCardPress={(movie) =>
            router.push(`/content/${movie.id}?type=${movie.contentType}`)
          }
        />

        {/* Eventos (usando la misma lógica que MovieCarousel) */}
        <MovieCarousel
          title="Eventos"
          movies={events}
          loading={loading}
          onSeeMore={() => router.push('/home/events')}
          onCardPress={(movie) =>
            router.push(`/content/${movie.id}?type=${movie.contentType}`)
          }
        />
      </ScrollView>

      <ChatAssistant />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.main,
  },
  header: {
    height: 70, // Altura fija
    backgroundColor: theme.colors.background.accent,
    borderBottomColor: 'rgba(255, 200, 100, 0.3)',
    borderBottomWidth: 1,
    flexDirection: 'row', // Elementos en fila
    alignItems: 'center', // Centrado vertical
    justifyContent: 'space-between', // Espacio entre izquierda y derecha
    paddingHorizontal: theme.spacing.s16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 16,
  },
  logo: {
    width: 120,
    height: 42,
    borderRadius: theme.borderRadius.s16,
    marginRight: theme.spacing.s12,
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.s8,
    paddingHorizontal: theme.spacing.s16,
    borderRadius: theme.borderRadius.s24,
    alignItems: 'center',
  },
  loginButtonText: {
    color: theme.colors.background.accent,
    fontSize: theme.typography.size.s14,
    fontFamily: theme.typography.family.primary.bold,
    marginRight: theme.spacing.s8,
  },
  scrollContent: {
    paddingBottom: theme.spacing.s32,
  },
  userProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfoText: {
    alignItems: 'flex-end',
    marginRight: theme.spacing.s12,
  },
  welcomeLabel: {
    color: theme.colors.itemInactive,
    fontSize: theme.typography.size.s10,
    fontFamily: theme.typography.family.primary.regular,
  },
  userNameText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.size.s14,
    fontFamily: theme.typography.family.primary.bold,
  },
  avatarMini: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.s8,
    borderRadius: theme.borderRadius.sFull,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});
