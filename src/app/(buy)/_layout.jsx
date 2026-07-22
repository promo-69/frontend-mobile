import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PurchaseSessionProvider } from '../../context/PurchaseSessionContext';

export default function BuyLayout() {
  return (
    <PurchaseSessionProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#231640' },
          headerTintColor: '#F6AD38',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Orden del flujo: tipo de boleto → asientos → ... */}
        <Stack.Screen name="tickets" options={{ title: 'Tipo de Boleto' }} />
        <Stack.Screen
          name="selectSeats"
          options={{ title: 'Selecciona tus Asientos' }}
        />
        <Stack.Screen
          name="concessions"
          options={{ title: 'Confitería & Snacks' }}
        />
        <Stack.Screen
          name="checkout"
          options={{ title: 'Resumen de tu Orden' }}
        />
        <Stack.Screen name="payment" options={{ title: 'Proceder al Pago' }} />
        <Stack.Screen
          name="order-success"
          options={{
            title: '¡Compra Exitosa!',
            headerLeft: () => null,
            gestureEnabled: false,
          }}
        />
      </Stack>
    </PurchaseSessionProvider>
  );
}
