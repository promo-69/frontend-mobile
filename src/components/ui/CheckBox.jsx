import { Check } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { theme } from '../../constants';
import { AppText } from './AppText';

export const Checkbox = ({ label, value, onChange, error, children }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.wrapper}
        onPress={() => onChange(!value)}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.box,
            value && styles.boxSelected,
            error && { borderColor: theme.colors.error },
          ]}
        >
          {value && <Check size={14} color="white" />}
        </View>

        <View style={styles.textContainer}>
          {children || (
            <AppText variant="label" style={styles.text}>
              {label}
            </AppText>
          )}
        </View>
      </TouchableOpacity>

      {error && <AppText style={styles.errorLabel}>{error}</AppText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.s8,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.s12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxSelected: {
    backgroundColor: theme.colors.primary,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  errorLabel: {
    color: theme.colors.error,
    ...theme.typography.variants.caption,
    marginTop: theme.spacing.s4,
    marginLeft: 32,
  },
});
