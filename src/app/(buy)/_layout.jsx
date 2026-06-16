import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function BuyLayout() {
  return (
    <>
      {/* Forzamos que la barra de estado del teléfono sea clara por el diseño oscuro del cine */}
      <StatusBar style="light" />
      
      <Stack
        screenOptions={{
          // Estilo global para las cabeceras del flujo de compra
          headerBackIcon: () => null, // Eliminamos el ícono de retroceso predeterminado para usar uno personalizado
        
          headerStatusBarHeight: 48,
          headerStyle: {
            backgroundColor: '#231640', 
          },
          
          headerTitleStyle: {
            color: '#FFFFFF',       
            
            fontSize: 18,           
            fontWeight: 'bold',     
          },
          contentStyle: { backgroundColor: '#231640' },
          headerTitleContainerStyle: {
            paddingVertical: 10, 
          },

          headerTitleAlign: 'center',
          
          // Animación de transición lateral nativa estándar (Deslizar desde la derecha)
          animation: 'slide_from_right', 

        
        }}

        
      >
        {/* Pantalla 1: Selección de Asientos    */}
        <Stack.Screen 
          name="selectSeats" 
          options={{ 
            title: 'Selecciona tus Asientos',

          }} 
        />
       
        {/* Pantalla 2: Confitería / Snacks 
        <Stack.Screen 
          name="confectionery" 
          options={{ 
            title: 'Confitería & Snacks',
          }} 
        />

        {/* Pantalla 3: Resumen del Pedido (Sustituto de tu OrderSummary web)
        <Stack.Screen 
          name="checkout" 
          options={{ 
            title: 'Resumen de tu Orden',
          }} 
        />

        {/* Pantalla 4: Pasarela de Pago Físico/Digital 
        <Stack.Screen 
          name="payment" 
          options={{ 
            title: 'Proceder al Pago',
          }} 
        />
       */}
      </Stack>
    </>
  );
}