import { useRef } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { theme } from '../constants';

export const OTPInput = ({ code, setCode, maxLength = 4 }) => {
  const inputRef = useRef(null);

  return (
    <Pressable
      style={styles.container}
      onPress={() => inputRef.current?.focus()}
    >
      {Array.from({ length: maxLength }).map((_, i) => (
        <View
          key={i}
          style={[styles.cell, code.length === i && styles.activeCell]}
        >
          <AppText variant="h2">{code[i] || ''}</AppText>
        </View>
      ))}
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={(text) =>
          setCode(text.replace(/[^0-9]/g, '').slice(0, maxLength))
        }
        keyboardType="number-pad"
        style={styles.hiddenInput}
        testID="otp-input-hidden"
        autoFocus
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 30,
  },
  cell: {
    width: 60,
    height: 70,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.s16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  activeCell: {
    borderColor: theme.colors.primary,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
  },
});
