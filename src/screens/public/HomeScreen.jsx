import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { 
  ChevronRight,
  MapPin,
  UserCircle
} from 'lucide-react-native';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MovieCarousel from '../../components/home/MovieCarousel';
import { useAuth } from '../../context/AuthContext';
import { getMoviesReleases, getUpcomingMovies } from '../../services/movies.service';

const COLORS = {
  bgDark: '#2C1A4A', 
  headerBg: '#442F6B', 
  accent: '#FFC864', 
  textMain: '#FFFFFF', 
  textGray: '#B0A8C5', 
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [releases, setReleases] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [relData, upData] = await Promise.all([
          getMoviesReleases(),
          getUpcomingMovies()
        ]);

      

        setReleases(relData || []);
        setUpcoming(upData || []);
      } catch (error) {
        console.error('Error crítico cargando la data del Home:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.locationContainer}>
            <MapPin size={18} color={COLORS.accent} />
            <Text style={styles.locationText}>Barquisimeto</Text>
            <ChevronRight size={16} color={COLORS.accent} />
          </TouchableOpacity>
        </View>
        
        <Image
          source={require('../../assets/images/android-icon-foreground.png')}
          style={styles.logo}
        />

        {/* Botón Ingresar */}
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.accent} />
        ) : (isAuthenticated && !!user?.firstName) ? (
          <TouchableOpacity
            style={styles.userProfileHeader}
            onPress={() => router.push('/(main)/profile')}
          >
            <View style={styles.userInfoText}>
              <Text style={styles.welcomeLabel}>¡Hola</Text>
              <Text style={styles.userNameText}>
                {user?.firstName ? `${user.firstName.split(' ')[0]}!` : '¡Usuario!'}
              </Text>
            </View>
            <View style={styles.avatarMini}>
              <UserCircle size={20} color={COLORS.bgDark} />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>Ingresar</Text>
            <UserCircle size={18} color={COLORS.bgDark} />
          </TouchableOpacity>
        )}
      </View>

      {/* Contenido Principal */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MovieCarousel 
          title="En Cartelera"
          movies={releases}
          loading={loading}
          onSeeMore={() => router.push('/movies/releases')}
          onCardPress={(m) => router.push(`/movie/${m.id}`)}
        />

        <MovieCarousel 
          title="Próximos Estrenos"
          movies={upcoming}
          loading={loading}
          onSeeMore={() => router.push('/movies/upcoming')}
          onCardPress={(m) => router.push(`/movie/${m.id}`)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({

  container: {

    flex: 1, // Ocupa todo el alto de la pantalla

    backgroundColor: COLORS.bgDark, // Fondo morado oscuro

  },



  // Estilos del Header

  header: {

    paddingTop: 20, // Espacio superior para no pegar con el notch

    height: 70, // Altura fija

    backgroundColor: COLORS.headerBg, // Fondo morado medio

    flexDirection: 'row', // Elementos en fila

    alignItems: 'center', // Centrado vertical

    justifyContent: 'space-between', // Espacio entre izquierda y derecha

    paddingHorizontal: 20, // Espacio interno lateral

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 3 },

    shadowOpacity: 0.3,

    shadowRadius: 3,

    elevation: 6,

    zIndex: 10, // Asegura que esté por encima del ScrollView

  },

  headerLeft: {

    flexDirection: 'row',

    alignItems: 'center',

  },

  logo: {

    width: 50,

    height: 50,

    borderRadius: 18,

    marginRight: 10,

  },

  loginImage: {

    width: 25,

    height: 25,

    marginLeft: 5,

  },

  locationContainer: {

    flexDirection: 'row',

    alignItems: 'center',

  },

  locationText: {

    color: COLORS.textMain,

    fontSize: 14,

    fontWeight: '600',

  },

  locationArrow: {

    color: COLORS.accent, // Dorado

    fontSize: 18,

    marginLeft: 5,

    fontWeight: 'bold',

  },

  loginButton: {

    flexDirection: 'row',

    backgroundColor: COLORS.accent, // Fondo dorado

    paddingVertical: 8,

    paddingHorizontal: 15,

    borderRadius: 20, // Bordes redondeados 'píldora'

    alignItems: 'center',

  },

  loginButtonText: {

    color: COLORS.bgDark, // Texto morado oscuro

    fontSize: 14,

    fontWeight: 'bold',

    marginRight: 8,

  },

  loginIcon: {

    fontSize: 16,

    color: COLORS.bgDark,

  },

  carouselScrollContainer: {

    paddingHorizontal: 10, // Espaciado al inicio y al final

  },

  posterWrapper: {

    width: 220, // El ancho de cada tarjeta de película

    marginRight: 15, // Espacio entre una película y otra

    alignItems: 'center',

  },

  posterScroll: {

    width: 200,

    height: 300,

    borderRadius: 20,

    backgroundColor: '#000', // Fondo de respaldo por si tarda en cargar

  },

  peliTitleScroll: {

    color: COLORS.textMain,

    fontSize: 18,

    fontWeight: 'bold',

    marginTop: 12,

    textAlign: 'center',

  },

  gridCardScroll: {

    width: 160, // Aumentado para que no se vea tan pequeño

    marginRight: 15,

    alignItems: 'center',

  },

  gridPosterScroll: {

    width: 160, // Debe coincidir con el width del contenedor

    height: 240, // Proporción de aspecto 2:3

    borderRadius: 15,

    backgroundColor: '#000',

  },

  gridPeliTitle: {

    color: COLORS.textMain,

    fontSize: 15, // Un pelín más pequeño que el título principal

    fontWeight: '600',

    textAlign: 'center',

    marginTop: 8,

  },



  // Estilos del Contenido Scrolleable

  scrollContent: {

    paddingBottom: 30, // Espacio al final para que no pegue

  },

  section: {

    marginTop: 25, // Espacio entre secciones

    paddingHorizontal: 15, // Espacio lateral para títulos

  },

  sectionTitle: {

    color: COLORS.accent, // Dorado

    fontSize: 22,

    fontWeight: 'bold',

    textTransform: 'uppercase', // Convierte a MAYÚSCULAS

    marginBottom: 15,

  },



  // Estilos del Carrusel de Películas

  carouselContainer: {

    flexDirection: 'row', // Fila

    justifyContent: 'center', // Centrado horizontal

    alignItems: 'center', // Centrado vertical de las imágenes

    marginBottom: 20,

    overflow: 'hidden', // Corta lo que se salga de la vista

  },

  poster: {

    borderRadius: 12,

  },

  posterCentralContainer: {

    alignItems: 'center',

    marginHorizontal: -30,

    zIndex: 5,

  },

  posterCentral: {

    width: 200, // Más grande

    height: 300,

  },

  posterSide: {

    width: 150, // Más pequeño

    height: 220,

    opacity: 0.5, // Semi-transparente

    zIndex: 1,

  },

  peliTitle: {

    color: COLORS.textMain,

    fontSize: 20,

    fontWeight: 'bold',

    marginTop: 15,

    textAlign: 'center',

  },



  // Flechas del Carrusel

  carouselArrows: {

    flexDirection: 'row',

    justifyContent: 'center',

    marginTop: -10, // Sube un poco para que estén más cerca del título

  },

  arrowCircle: {

    width: 40,

    height: 40,

    borderRadius: 20,

    backgroundColor: COLORS.headerBg,

    alignItems: 'center',

    justifyContent: 'center',

    marginHorizontal: 20,

    borderWidth: 1,

    borderColor: COLORS.textGray,

  },

  arrowText: {

    color: COLORS.textMain,

    fontSize: 24,

    fontWeight: 'bold',

    lineHeight: 28, // Ajuste visual de la flecha

  },



  // Estilos de la Grilla "PARA TÍ"

  gridContainer: {

    flexDirection: 'row',

    justifyContent: 'space-between',

  },

  gridCard: {

    width: '48%',

    alignItems: 'center',

    marginBottom: 15,

  },

  gridPoster: {

    width: '100%', // Usa todo el ancho de la tarjeta

    height: 260,

    borderRadius: 15,

    marginBottom: 10,

  },

  gridPeliTitle: {

    color: COLORS.textMain,

    fontSize: 16,

    fontWeight: '600',

    textAlign: 'center',

  },

  gridPeliTitleSmall: {

    color: COLORS.textMain,

    fontSize: 15,

    fontWeight: '500',

    textAlign: 'center',

    marginTop: 8,

  },



  // Estilos Perfil (Autenticado)

  userProfileHeader: { flexDirection: 'row', alignItems: 'center' },

  userInfoText: { alignItems: 'flex-end', marginRight: 10 },

  welcomeLabel: { color: COLORS.textGray, fontSize: 10, fontFamily: 'MainRegular' },

  userNameText: { color: COLORS.textMain, fontSize: 14, fontFamily: 'MainBold' },

  avatarMini: {

    backgroundColor: COLORS.accent,

    padding: 8,

    borderRadius: 25,

    borderWidth: 2,

    borderColor: 'rgba(255,255,255,0.1)'

  },



  checkConnectionButton: {

    backgroundColor: COLORS.accent,

    padding: 10,

    borderRadius: 5,

    alignItems: 'center',

    marginTop: 20,

  },

  checkConnectionText: {

    color: COLORS.textMain,

    fontSize: 16,

    fontWeight: 'bold',

  },

});