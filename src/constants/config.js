
const DEV_URL = process.env.PUBLIC_DEV_URL;
const PROD_URL = process.env.PUBLIC_PROD_URL;


export const ENV = {
  API_URL: __DEV__ ? DEV_URL : PROD_URL
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