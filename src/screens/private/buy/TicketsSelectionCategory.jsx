import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const TICKET_CATEGORIES = [
  { id: '1', name: 'GENERAL', key: 'general', price: 612.43, description: 'Público general adulto.' },
  { id: '2', name: 'NIÑO', key: 'kid', price: 306.21, description: 'Menores de 12 años.' },
  { id: '3', name: 'TERCERA EDAD', key: 'old', price: 306.21, description: 'Mayores de 60 años.' },
];