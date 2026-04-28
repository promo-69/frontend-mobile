
// URLs de conexión
const LOCAL_IP = '192.168.1.XX'; 
const PORT = '3000';

const DEV_URL = `http://${LOCAL_IP}:${PORT}/api`;
const PROD_URL = 'https://backend-jog6.onrender.com/api';

export const ENV = {
  API_URL: __DEV__ ? DEV_URL : PROD_URL,
  TIMEOUT: 60000,
};

// Endpoints centralizados para no escribirlos manualmente en los servicios
export const ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_SESSION: '/auth/refresh',
  LOGOUT: '/auth/logout',
  VALIDATE_QR: '/tickets/validate',
};

// Llaves para AsyncStorage (Bearer + Refresh) Centralizados para evitar errores de tipeo y facilitar cambios futuros
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@access_token',
  REFRESH_TOKEN: '@refresh_token',
  USER: '@user_data',
};

export const HEADERS = {
  JSON: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  AUTH_PREFIX: 'Bearer', 
};