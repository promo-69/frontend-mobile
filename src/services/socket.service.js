import { io } from 'socket.io-client';
import { ENV } from '../constants/config';
import { storageHelper } from '../helper/storage.helper';

/**
 * El backend expone Socket.io en la raíz del servidor, mientras que la API REST
 * vive bajo un prefijo (ej. /api/v1). Derivamos la URL base (origin) quitando
 * cualquier path del API_URL.
 */
function getSocketBaseUrl() {
  const apiUrl = ENV.API_URL || '';
  const match = apiUrl.match(/^(https?:\/\/[^/]+)/i);
  const base = match ? match[1] : apiUrl;
  return base;
}

let socket = null;

/**
 * Devuelve la instancia de socket conectada (singleton).
 * Crea la conexión la primera vez, autenticando con el access token.
 */
export async function getSocket() {
  if (socket && socket.connected) return socket;

  const token = await storageHelper.getAccessToken();
  const baseUrl = getSocketBaseUrl();

  if (__DEV__) {
    console.log('[socket] base URL:', baseUrl);
    console.log('[socket] token present:', !!token);
  }

  // Si ya existe pero está desconectado, refrescamos el token y reconectamos
  if (socket) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
    return socket;
  }

  socket = io(baseUrl, {
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
    auth: { token },
  });

  // Logs de diagnóstico (solo en desarrollo)
  if (__DEV__) {
    socket.on('connect', () => console.log('[socket] connected:', socket.id));
    socket.on('disconnect', (reason) =>
      console.log('[socket] disconnected:', reason)
    );
    socket.on('connect_error', (err) =>
      console.log('[socket] connect_error:', err?.message, err?.data || '')
    );
  }

  return socket;
}

/**
 * Cierra y limpia la conexión de socket.
 */
export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

/**
 * Devuelve la instancia actual sin crear una nueva (puede ser null).
 */
export function getSocketInstance() {
  return socket;
}
