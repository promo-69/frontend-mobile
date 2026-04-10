import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { theme } from '../../constants';
import { Input } from './Input';

export const DateInput = ({ label, value, onChange, placeholder, error }) => {
  const [show, setShow] = useState(false);

  const handleChange = (event, selectedDate) => {
    setShow(false);

    if (selectedDate && event.type !== 'dismissed') {
      // Extraemos componentes de fecha local para evitar errores de zona horaria (UTC vs Local)
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');

      const standardDate = `${year}-${month}-${day}`;
      onChange(standardDate);
    }
  };

  // Transformamos el valor YYYY-MM-DD del estado al formato visual DD/MM/AAAA
  const displayValue =
    value && value.includes('-') ? value.split('-').reverse().join('/') : value;

  return (
    <>
      <Pressable onPress={() => setShow(true)} style={{ width: '100%' }}>
        <View pointerEvents="none">
          <Input
            label={label}
            value={displayValue}
            placeholder={placeholder}
            editable={false}
            error={error}
            rightIcon={<Calendar size={20} color={theme.colors.secondary} />}
          />
        </View>
      </Pressable>

      {show && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
          onChange={handleChange}
          maximumDate={new Date()}
        />
      )}
    </>
  );
};
