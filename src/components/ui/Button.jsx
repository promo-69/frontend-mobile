import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import {theme} from '../../constants';

export const Button = ({ title, onPress, disabled = false, style }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
     
      style={[
        styles.base,
        { backgroundColor: theme.colors.primary }, 
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.text}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    width: '100%',
    height: 56,                
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...theme.typography.variants.button,
    color: theme.colors.textPrimary,          
    textAlign: 'center',
  },
});