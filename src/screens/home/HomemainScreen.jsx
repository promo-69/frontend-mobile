import { useRouter } from 'expo-router';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

// Constantes de diseño para mantener consistencia
const COLORS = {
  bgDark: '#2C1A4A', // Fondo principal morado oscuro
  headerBg: '#442F6B', // Fondo del header morado medio
  accent: '#FFC864', // Dorado para botones y títulos
  textMain: '#FFFFFF', // Texto principal blanco
  textGray: '#B0A8C5', // Texto secundario grisáceo
};

export default function HomemainScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Manejo de navegación protegida al perfil
  const handleProfilePress = () => {
    if (isAuthenticated) {
      router.push('/profile');
    } else {
      router.push('/login');
    }
  };

  return (
    // 1. SafeAreaView: Asegura que el contenido no se tape con el 'notch' o barra de estado
    <SafeAreaView style={styles.container}>
      {/* 2. StatusBar: Configuramos la barra de estado del teléfono */}
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* 3. Header (Cabecera Fija) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/images/android-icon-foreground.png')}
            style={styles.logo}
          />
          {/* Ubicación */}
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>📍 Barquisimeto</Text>
            <Text style={styles.locationArrow}>›</Text>
          </View>
        </View>

        {/* Botón Ingresar */}
        {!isAuthenticated && (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Ingresar</Text>
            <Image
              source={require('../../assets/images/circle-user.png')}
              style={styles.loginImage}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* 4. ScrollView: Contenido Principal Scrolleable */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Sección EN CARTELERA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EN CARTELERA</Text>

          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselScrollContainer}
            snapToAlignment="start"
            decelerationRate="fast"
          >
            {/* Película 1 */}
            <TouchableOpacity style={styles.posterWrapper}>
              <Image
                source={require('../../assets/images/peli1.jpg')}
                style={styles.posterScroll}
              />
              <Text style={styles.peliTitleScroll}>Hajime no Ippo</Text>
            </TouchableOpacity>

            {/* Película 2 */}
            <TouchableOpacity style={styles.posterWrapper}>
              <Image
                source={require('../../assets/images/peli2.jpg')}
                style={styles.posterScroll}
              />
              <Text style={styles.peliTitleScroll}>Hoppers</Text>
            </TouchableOpacity>

            {/* Película 3 */}
            <TouchableOpacity style={styles.posterWrapper}>
              <Image
                source={require('../../assets/images/peli3.jpg')}
                style={styles.posterScroll}
              />
              <Text style={styles.peliTitleScroll}>Matrix</Text>
            </TouchableOpacity>

            {/* Película 4 */}
            <TouchableOpacity style={styles.posterWrapper}>
              <Image
                source={require('../../assets/images/peli4.jpg')}
                style={styles.posterScroll}
              />
              <Text style={styles.peliTitleScroll}>Lucy 2</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Sección ¡PARA TÍ! */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¡PARA TÍ!</Text>

          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselScrollContainer}
          >
            {/* Película 1 */}
            <TouchableOpacity style={styles.gridCardScroll}>
              <Image
                source={require('../../assets/images/peli4.jpg')}
                style={styles.gridPosterScroll}
              />
              <Text style={styles.gridPeliTitle}>Hajime no Ippo</Text>
            </TouchableOpacity>

            {/* Película 2 */}
            <TouchableOpacity style={styles.gridCardScroll}>
              <Image
                source={require('../../assets/images/peli5.jpg')}
                style={styles.gridPosterScroll}
              />
              <Text style={styles.gridPeliTitle}>David</Text>
            </TouchableOpacity>

            {/* Película 3 */}
            <TouchableOpacity style={styles.gridCardScroll}>
              <Image
                source={require('../../assets/images/peli3.jpg')}
                style={styles.gridPosterScroll}
              />
              <Text style={styles.gridPeliTitle}>Matrix</Text>
            </TouchableOpacity>

            {/* Película 4 */}
            <TouchableOpacity style={styles.gridCardScroll}>
              <Image
                source={require('../../assets/images/peli7.jpg')}
                style={styles.gridPosterScroll}
              />
              <Text style={styles.gridPeliTitle}>Lucy 2</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Sección PRÓXIMOS ESTRENOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximos Estrenos</Text>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselScrollContainer}
          >
            {/* Película 1 */}
            <View style={styles.gridCardScroll}>
              <Image
                source={require('../../assets/images/peli6.jpg')}
                style={styles.gridPosterScroll}
              />
              <Text style={styles.gridPeliTitleSmall}>Matrix</Text>
            </View>

            {/* Película 2 */}
            <View style={styles.gridCardScroll}>
              <Image
                source={require('../../assets/images/peli7.jpg')}
                style={styles.gridPosterScroll}
              />
              <Text style={styles.gridPeliTitleSmall}>Lucy 2</Text>
            </View>

            {/* Película 3 (Ejemplo para ver el scroll) */}
            <View style={styles.gridCardScroll}>
              <Image
                source={require('../../assets/images/peli1.jpg')}
                style={styles.gridPosterScroll}
              />
              <Text style={styles.gridPeliTitleSmall}>Película 3</Text>
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Botón Flotante SCAN */}
      <TouchableOpacity style={styles.scanButton}>
        <Image
          source={require('../../assets/images/qr-code.png')}
          style={styles.scanIcon}
        />
        <Text style={styles.scanText}>Scan</Text>
      </TouchableOpacity>

      {/* Menú Inferior (Tab Bar) */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={[styles.tabText, { color: COLORS.accent }]}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIcon}>🍿</Text>
          <Text style={styles.tabText}>Confitería</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIcon}>📍</Text>
          <Text style={styles.tabText}>Sucursales</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={handleProfilePress}>
          <Image
            source={require('../../assets/images/circle-user.png')}
            style={styles.tabIcon}
          />
          <Text style={styles.tabText}>Mi Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// 5. StyleSheet: Definición de todos los estilos
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
    // Sombras para iOS y Android
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
    marginHorizontal: -30, // Esto hace que los posters de los lados se 'monten'
    zIndex: 5, // Asegura que esté por encima de los posters laterales
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
    justifyContent: 'space-between', // Una a cada lado
  },
  gridCard: {
    width: '48%', // Casi la mitad
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
  // Botón Flotante Scan
  scanButton: {
    position: 'absolute',
    bottom: 95, // Por encima del tab bar
    right: 20,
    backgroundColor: COLORS.accent,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  scanIcon: { fontSize: 20 },
  scanText: { fontSize: 10, fontWeight: 'bold', color: '#000' },

  // Tab Bar Estilos
  tabBar: {
    flexDirection: 'row',
    height: 55,
    backgroundColor: COLORS.tabBarBg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 2,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
    color: COLORS.textMain,
    marginBottom: 4,
  },
  tabIcon2: {
    tintColor: COLORS.textMain,
    fontSize: 22,
    marginBottom: 4,
  },
  tabText: {
    color: COLORS.textGray,
    fontSize: 11,
  },
});
