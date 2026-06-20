import { ActivityIndicator, FlatList, StyleSheet, View, Text } from 'react-native';
import CinemaCard from './CinemaCard';

export default function CinemaGrid({ cinemas = [], onPress, onLoadMore, loadingMore }) {
  
  if (!cinemas || cinemas.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay sucursales disponibles por ahora.</Text>
      </View>
    );
  }

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#FFC864" />
      </View>
    );
  };

  return (
    <FlatList
      data={cinemas}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <CinemaCard 
        cinema={item} 
        onPress={() => onPress(item.id)}
        />

      ) }
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
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
