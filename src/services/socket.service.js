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
// Token con el que el socket se conectó/autenticó por última vez. Si el access
// token cambia (refresh por 401), lo detectamos y reconectamos para que el
// backend re-autentique con la identidad correcta.
let currentAuthToken = null;

// Nombre de la cookie de access que el backend espera en el handshake del socket
// (JWT_COOKIE_ACCESS_NAME en el backend; por defecto 'AT'). El backend, al
// autenticar el socket, lee la cookie ANTES que auth.token, así que mandamos
// aquí la cookie con el token vigente para replicar lo que hace la web.
const ACCESS_COOKIE_NAME = 'AT';

/**
 * Fuerza un re-handshake del socket con el token vigente.
 * Se llama tras un refresh de token (desde api.js) y cuando getSocket detecta
 * que el token cambió.
 */
function reconnectWith(token) {
  currentAuthToken = token;
  if (!socket) return;
  socket.auth = { token };
  // Actualizamos también la cookie del handshake con el token nuevo.
  if (socket.io?.opts) {
    socket.io.opts.extraHeaders = {
      ...(socket.io.opts.extraHeaders || {}),
      Cookie: `${ACCESS_COOKIE_NAME}=${token}`,
    };
  }
  if (socket.connected) socket.disconnect();
  socket.connect();
}

/**
 * Devuelve la instancia de socket conectada (singleton).
 * Crea la conexión la primera vez, autenticando con el access token vigente.
 * Si el token cambió desde la última conexión, reconecta con el nuevo.
 */
export async function getSocket() {
  const token = await storageHelper.getAccessToken();

  // El token cambió (p.ej. se refrescó por 401): reconectar con el nuevo para
  // que el backend vuelva a validar la identidad. Sin esto, el socket se queda
  // autenticado con el token viejo y el backend no encuentra la sesión de
  // compra creada bajo el usuario del token nuevo.
  if (socket && currentAuthToken !== token) {
    if (__DEV__) console.log('[socket] token cambió → reconectando');
    reconnectWith(token);
    return socket;
  }

  if (socket && socket.connected) return socket;

  const baseUrl = getSocketBaseUrl();

  if (__DEV__) {
    console.log('[socket] base URL:', baseUrl);
    console.log('[socket] token present:', !!token);
  }

  // Existe pero desconectado: refrescamos token y reconectamos.
  if (socket) {
    socket.auth = { token };
    currentAuthToken = token;
    if (!socket.connected) socket.connect();
    return socket;
  }

  currentAuthToken = token;
  socket = io(baseUrl, {
    // Polling primero: el handshake inicial va por XHR y así viaja el header
    // Cookie que ponemos abajo; luego sube a websocket.
    transports: ['polling', 'websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
    auth: { token },
    // Replicamos la cookie de la web: el backend lee la cookie ANTES que
    // auth.token, así que le damos la cookie con el token vigente para que el
    // socket quede autenticado con la MISMA identidad que el REST.
    extraHeaders: {
      Cookie: `${ACCESS_COOKIE_NAME}=${token}`,
    },
  });

  // Antes de cada (re)intento de conexión, refrescamos el token en el handshake.
  socket.io.on('reconnect_attempt', async () => {
    try {
      const fresh = await storageHelper.getAccessToken();
      currentAuthToken = fresh;
      socket.auth = { token: fresh };
      socket.io.opts.extraHeaders = {
        ...(socket.io.opts.extraHeaders || {}),
        Cookie: `${ACCESS_COOKIE_NAME}=${fresh}`,
      };
    } catch {
      // Si falla, se reintenta con el token actual.
    }
  });

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
 * Reautentica el socket con el token vigente. Llamar tras refrescar el token
 * (desde el interceptor de api.js), para que la conexión no quede con la
 * identidad del token viejo.
 */
export async function reauthenticateSocket() {
  try {
    const token = await storageHelper.getAccessToken();
    if (!socket) {
      // Aún no hay socket; el próximo getSocket usará el token fresco.
      currentAuthToken = token;
      return;
    }
    if (currentAuthToken !== token) {
      if (__DEV__) console.log('[socket] reauth tras refresh → reconectando');
      reconnectWith(token);
    }
  } catch {
    // Sin token; no hacemos nada.
  }
}

/**
 * Cierra y limpia la conexión de socket.
 */
export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    currentAuthToken = null;
  }
}

/**
 * Devuelve la instancia actual sin crear una nueva (puede ser null).
 */
export function getSocketInstance() {
  return socket;
}
