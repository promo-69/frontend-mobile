import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { AppText } from '../../components/ui/AppText';
import CinemaCard from './CinemaCard';

export default function CinemaGrid({
  cinemas = [],
  onPress,
  onLoadMore,
  loadingMore,
}) {
  if (!cinemas || cinemas.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No hay sucursales disponibles por ahora.
        </Text>
      </View>
    );
  }

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="theme.colors.primary" />
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.borderIndicator}>
        {/* TÍTULO PRINCIPAL */}
        <AppText style={styles.mainTitle}>
          Nuestros <AppText style={styles.highlightedText}>Cines</AppText>
        </AppText>

        {/* TEXTO DESCRIPTIVO */}
        <AppText style={styles.subtitle}>
          Encuentra el complejo Cineflix más cercano a ti y vive la magia.
        </AppText>
      </View>
    </View>
  );

  return (
    <FlatList
      data={cinemas}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <CinemaCard cinema={item} onPress={() => onPress(item.id)} />
      )}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={renderHeader}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderFooter}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  borderIndicator: {
    borderLeftWidth: 4,
    borderLeftColor: '#F6AD38',
    paddingLeft: 16,
    alignItems: 'flex-start',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    lineHeight: 24,
    color: '#FFFFFF',
  },
  highlightedText: {
    fontSize: 28,
    color: '#F6AD38',
  },
  subtitle: {
    fontSize: 14,
    color: '#B0A8C5',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'semibold',
    lineHeight: 20,
    marginTop: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#B0A8C5',
    fontSize: 16,
    textAlign: 'center',
  },
});
