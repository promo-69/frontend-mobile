import React, { useState } from 'react';
import { Pressable, View, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { Input } from './Input';
import { theme } from '../../constants';

export const DateInput = ({ label, value, onChange, placeholder, error }) => {
  const [show, setShow] = useState(false);

  const handleChange = (event, selectedDate) => {

    setShow(false);

    if(selectedDate && event.type !== 'dismissed'){
    
    // Formato visual para el usuario (DD/MM/AAAA)
    const displayDate = selectedDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

     // Formato estándar para la base de datos (YYYY-MM-DD)
    const standardDate = selectedDate.toISOString().split('T')[0];
    onChange(displayDate, standardDate);

    }
   
    
  };

  return (
    <>
      <Pressable onPress={() => setShow(true)} style={{ width: '100%' }}>
        <View pointerEvents="none">
          <Input
            label={label}
            value={value}
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