import { ChevronDown } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { theme } from '../../constants';
import { useSelector } from '../../hooks/shared/useSelector';
import { AppText } from '../AppText';
import { Input } from './Input';

export const SelectorInput = ({
  value,
  onChangeText,
  onSelect,
  options = ['V', 'E'],
  keyboardType = 'numeric',
  ...props
}) => {
  const { selectedValue, isOpen, toggle, select } = useSelector(options[0]);

  const handleSelect = (opt) => {
    select(opt);
    if (onSelect) onSelect(opt);
  };

  return (
    <View style={styles.container}>
      <View style={styles.selectorWrapper}>
        <TouchableOpacity
          style={styles.trigger}
          onPress={toggle}
          activeOpacity={0.7}
        >
          <AppText variant="body" style={styles.triggerText}>
            {selectedValue}
          </AppText>
          {/* Icono de Lucide con rotación si está abierto */}
          <ChevronDown
            size={theme.spacing.s16}
            color={theme.colors.primary}
            style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
          />
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.dropdown}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.option}
                onPress={() => handleSelect(opt)}
              >
                <AppText variant="body" style={styles.optionText}>
                  {opt}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Input
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          {...props}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 56,
    zIndex: 1000,
  },
  selectorWrapper: {
    marginRight: theme.spacing.s12,
    position: 'relative',
  },
  trigger: {
    width: 70,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  triggerText: {
    color: theme.colors.textPrimary,
  },
  dropdown: {
    position: 'absolute',
    top: 52,
    left: 0,
    width: 70,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    elevation: 10,
    shadowColor: theme.colors.midnight[950],
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  option: {
    paddingVertical: theme.spacing.s12,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  optionText: {
    color: theme.colors.textPrimary,
  },
});
