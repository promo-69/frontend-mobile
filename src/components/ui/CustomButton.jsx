import { Pressable, TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, Platform} from 'react-native';
import {theme} from '../../constants';

export const CustomButton = ({ title, onPress, disabled = false, loading = false, style }) => {
  return (
    <Pressable
      onPress={loading ? null : onPress}
      disabled={disabled || loading}
      android_ripple={{ color: 'rgba(255,255,255,0.3)',
        borderless: false
      }}
      style={( {pressed }) => [
        styles.base,
        pressed && Platform.OS === 'ios' && !disabled && !loading && { opacity: 0.7 },
        (disabled || loading) && styles.disabled,
        style,

      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            color={theme.colors.textPrimary}
            size="small"
          />
        ) : (
          <Text style={styles.text}>
            {title}
          </Text>
        )}
      </View>
    </Pressable>
    /*
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
     
      style={[
        styles.base,
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.text}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>*/
  );
};

const styles = StyleSheet.create({
  base: {
    width: '100%',
    height: 56,
    backgroundColor: theme.colors.primary,                
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 4,
    
    shadowColor: '#797979',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    
  },
  disabled: {
    opacity: 0.5,
    elevation: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  text: {
    ...theme.typography.variants.button,
    color: theme.colors.textPrimary,
    textAlign: 'center',         
    textAlignVertical: 'center',
  },
});