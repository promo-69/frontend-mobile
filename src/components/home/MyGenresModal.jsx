import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { X, Check, Film } from 'lucide-react-native';
import { theme } from '../../constants';
import {
  getAvailableGenres,
  getMoviesGenres,
  addFavoriteGenres,
  removeFavoriteGenres
} from '../../services/movies.service';

export default function MyGenresModal({ open, onClose }) {
  const [catalogGenres, setCatalogGenres] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [initialFavoriteIds, setInitialFavoriteIds] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function fetchGenresData() {
      try {
        setLoading(true);
        const [allGenres, userFavorites] = await Promise.all([
          getAvailableGenres(),
          getMoviesGenres()
        ]);

        setCatalogGenres(allGenres);
        const favoriteIds = userFavorites.map(g => g.id);
        setSelectedIds(favoriteIds);
        setInitialFavoriteIds(favoriteIds);
      } catch (error) {
        console.error('❌ Error al sincronizar el catálogo de géneros:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGenresData();
  }, [open]);

  const handleToggleGenre = (genreId) => {
    setSelectedIds(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId) 
        : [...prev, genreId]
    );
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const genresToAdd = selectedIds.filter(id => !initialFavoriteIds.includes(id));
      const genresToRemove = initialFavoriteIds.filter(id => !selectedIds.includes(id));

      const apiCalls = [];
      if (genresToAdd.length > 0) apiCalls.push(addFavoriteGenres(genresToAdd));
      if (genresToRemove.length > 0) apiCalls.push(removeFavoriteGenres(genresToRemove));

      if (apiCalls.length > 0) {
        await Promise.all(apiCalls);
      }

      onClose(true); // Cierra notificando éxito para refrescar la parrilla principal
    } catch (error) {
      console.error('Error al actualizar tus géneros de preferencia:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={() => !saving && onClose(false)}
    >
      <View style={styles.modalOverlay}>
        {/* Fondo oscuro traslúcido para cerrar */}
        <Pressable 
          style={styles.absoluteDismiss} 
          onPress={() => !saving && onClose(false)} 
        />

        <View style={styles.modalContainer}>
          
          {/* ENCABEZADO FIJO */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.iconContainer}>
                <Film size={18} color={theme.colors.textAccent.gold} />
              </View>
              <View style={styles.textContainer}>
                <Text numberOfLines={1} style={styles.modalTitle}>
                  Mis Preferencias
                </Text>
                <Text numberOfLines={2} style={styles.modalSubtitle}>
                  Selecciona tus géneros favoritos para personalizar tu cartelera
                </Text>
              </View>
            </View>
            
            <Pressable 
              disabled={saving} 
              onPress={() => onClose(false)} 
              style={styles.closeButton}
            >
              <X size={20} color={theme.colors.textDisabled} />
            </Pressable>
          </View>

          {/* CUERPO CENTRAL DE OPCIONES INTERACTIVAS */}
          <View style={styles.bodyContainer}>
            {loading ? (
              <View style={styles.innerLoader}>
                <ActivityIndicator size="small" color={theme.colors.textAccent.gold} />
                <Text style={styles.syncText}>Sincronizando catálogo...</Text>
              </View>
            ) : catalogGenres.length === 0 ? (
              <Text style={styles.errorText}>No se pudieron recuperar los géneros disponibles.</Text>
            ) : (
              <FlatList
                data={catalogGenres}
                keyExtractor={(item) => `modal-genre-${item.id}`}
                numColumns={2}
                columnWrapperStyle={styles.genreRow}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <Pressable
                      onPress={() => handleToggleGenre(item.id)}
                      style={[
                        styles.genreCard,
                        isSelected ? styles.genreCardSelected : styles.genreCardUnselected
                      ]}
                    >
                      <Text numberOfLines={1} style={[styles.genreLabel, isSelected && styles.genreLabelSelected]}>
                        {item.description || item.name}
                      </Text>
                      
                      <View style={[styles.checkbox, isSelected ? styles.checkboxSelected : styles.checkboxUnselected]}>
                        {isSelected && <Check size={10} color={theme.colors.textBlack} strokeWidth={4} />}
                      </View>
                    </Pressable>
                  );
                }}
              />
            )}
          </View>

          {/* ACCIONES FIJAS DEL MODAL */}
          <View style={styles.modalFooter}>
            <Text style={styles.selectionCounter}>
              {selectedIds.length} {selectedIds.length === 1 ? 'seleccionado' : 'seleccionados'}
            </Text>
            
            <View style={styles.actionsRow}>
              <Pressable 
                disabled={saving} 
                onPress={() => onClose(false)} 
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable 
                disabled={loading || saving} 
                onPress={handleSaveChanges} 
                style={[styles.saveButton, (loading || saving) && styles.disabledButton]}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={theme.colors.textBlack} />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar</Text>
                )}
              </Pressable>
            </View>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 10, 25, 0.75)',
    justifyContent: 'flex-end', // Desliza como un panel inferior nativo excelente para mobile
  },
  absoluteDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: theme.colors.midnight[950],
    borderTopLeftRadius: theme.borderRadius.s24,
    borderTopRightRadius: theme.borderRadius.s24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    maxHeight: '85%',
  },
modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.s16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: theme.spacing.s12,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s12,
    flex: 1,
  },
  iconContainer: {
    padding: theme.spacing.s8,
    backgroundColor: 'rgba(219, 152, 47, 0.1)',
    borderRadius: theme.borderRadius.s8,
    borderWidth: 1,
    borderColor: 'rgba(219, 152, 47, 0.15)',
  },
  textContainer: {
    flex: 1, 
  },
  modalTitle: {
    ...theme.typography.variants.subtitle,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.family.primary.bold,
    textTransform: 'uppercase',
  },
  modalSubtitle: {
    fontSize: 11,
    color: theme.colors.textDisabled,
    fontFamily: theme.typography.family.primary.medium,
    marginTop: 2
  },
  closeButton: {
    padding: theme.spacing.s4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.s8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyContainer: {
    padding: theme.spacing.s16,
    minHeight: 220,
  },
  innerLoader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.s48,
    gap: theme.spacing.s8,
  },
  syncText: {
    fontSize: 11,
    fontFamily: theme.typography.family.primary.medium,
    color: theme.colors.textDisabled,
    textTransform: 'uppercase',
  },
  genreRow: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing.s12,
  },
  genreCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.s16,
    borderRadius: theme.borderRadius.s12,
    borderWidth: 1,
  },
  genreCardUnselected: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  genreCardSelected: {
    backgroundColor: 'rgba(123, 26, 130, 0.2)',
    borderColor: theme.colors.borders.accent,
  },
  genreLabel: {
    ...theme.typography.variants.body,
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.family.primary.bold,
    flex: 1,
    marginRight: theme.spacing.s4,
  },
  genreLabelSelected: {
    color: theme.colors.textPrimary,
  },
  checkbox: {
    height: 18,
    width: 18,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxUnselected: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.textAccent.gold,
    borderColor: theme.colors.textAccent.gold,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.s16,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectionCounter: {
    ...theme.typography.variants.caption,
    color: theme.colors.textDisabled,
    fontFamily: theme.typography.family.primary.semiBold,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.s8,
  },
  cancelButton: {
    paddingHorizontal: theme.spacing.s16,
    paddingVertical: theme.spacing.s8,
    borderRadius: theme.borderRadius.s8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cancelButtonText: {
    ...theme.typography.variants.label,
    color: theme.colors.textSecondary,
  },
  saveButton: {
    paddingHorizontal: theme.spacing.s24,
    paddingVertical: theme.spacing.s8,
    borderRadius: theme.borderRadius.s8,
    backgroundColor: theme.colors.textAccent.gold,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    ...theme.typography.variants.label,
    color: theme.colors.textBlack,
    fontFamily: theme.typography.family.primary.bold,
  },
  disabledButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    opacity: 0.4,
  },
  errorText: {
    ...theme.typography.variants.body,
    color: theme.colors.textDisabled,
    textAlign: 'center',
    fontStyle: 'italic',
  }
});