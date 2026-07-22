import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid/non-secure';

/**
 * Identificador único y permanente de este dispositivo (x-device-id).
 */

const DEVICE_ID_KEY = '@device_id';

// Caché en memoria: tras la primera lectura, no volvemos a tocar AsyncStorage.
let cachedDeviceId = null;
// Promesa en vuelo para evitar carreras (dos peticiones simultáneas al abrir
// la app no deben generar dos IDs distintos).
let pendingInit = null;

async function _loadOrCreate() {
  try {
    const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (stored) {
      cachedDeviceId = stored;
      return stored;
    }
    const fresh = nanoid(); // 21 caracteres alfanuméricos por defecto
    await AsyncStorage.setItem(DEVICE_ID_KEY, fresh);
    cachedDeviceId = fresh;
    return fresh;
  } catch (error) {
    console.error('Error al obtener/crear el device id:', error);
    // Degradación: ID efímero en memoria para no bloquear las peticiones.
    // En el próximo arranque se intentará persistir uno de nuevo.
    if (!cachedDeviceId) cachedDeviceId = nanoid();
    return cachedDeviceId;
  }
}

/**
 * Devuelve el device id (creándolo y persistiéndolo la primera vez).
 * Idempotente y a prueba de llamadas concurrentes.
 */
export async function getDeviceId() {
  if (cachedDeviceId) return cachedDeviceId;
  if (!pendingInit) {
    pendingInit = _loadOrCreate().finally(() => {
      pendingInit = null;
    });
  }
  return pendingInit;
}
