// src/app/(main)/profile/_layout.jsx
import { Stack } from 'expo-router';
import { theme } from '../../../constants';

export default function CinemasLayout() {
  return (
    <Stack
      screenOptions={{
       
        headerShown: false, 
        contentStyle: {
          backgroundColor: theme.colors.background
        },
        animation: 'slide_from_bottom', 
      }}
    >
      
      <Stack.Screen 
        name="index" 
        options={{ title: 'Cines' }} 
      />

    </Stack>
  );
}