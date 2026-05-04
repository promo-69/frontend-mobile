
// URLs de conexión
const LOCAL_IP = '192.168.1.XX'; 
const PORT = '3000';

const DEV_URL = `https://backend-jog6.onrender.com/api/v1/test`;
const PROD_URL = 'https://backend-jog6.onrender.com';

export const ENV = {
  API_URL: __DEV__ ? DEV_URL : PROD_URL
};

// Endpoints centralizados para no escribirlos manualmente en los servicios
export const ENDPOINTS = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signUp',
  REFRESH_SESSION: '/auth/refresh',
  SEND_RECOVERY: '/auth/recovery/send-email',
  VERIFY_CODE: '/auth/recovery/verify-code',
  RESET_PASSWORD: '/auth/recovery/reset-password',
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