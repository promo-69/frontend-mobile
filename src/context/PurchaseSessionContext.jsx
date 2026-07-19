import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  createQuote,
  cancelSession,
  cancelSessionWithRetries,
} from '../services/orders.service';
import { disconnectSocket } from '../services/socket.service';

const PurchaseSessionContext = createContext(undefined);

// ─── Epoch de sesión a nivel de MÓDULO ───────────────────────────────────────
// Sobrevive a los remontajes del provider (a diferencia de refs/estado).
// Cada vez que se crea una quote nueva, el epoch avanza. Un cleanup viejo solo
// puede cancelar la sesión si su epoch sigue siendo el vigente; si otra
// instancia ya creó una quote más nueva, el cleanup viejo NO la toca.
// Esto elimina la carrera: cancelSessionWithRetries (con backoff) aterrizando
// tarde y borrando la quote recién creada por la instancia nueva.
let globalSessionEpoch = 0;

export function PurchaseSessionProvider({ children }) {
  const [quoteReady, setQuoteReady] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState(null);

  // Sucursal para la que la quote está activa (evita reabrir si ya está lista)
  const activeCinemaRef = useRef(null);
  // Epoch de la quote creada por ESTA instancia del provider
  const myEpochRef = useRef(0);
  // Candado anti-carrera: garantiza un solo createQuote en vuelo
  const initLockRef = useRef(false);

  const _openQuote = useCallback(async (cid) => {
    try {
      // Intentamos crear directo. En un inicio limpio no hay sesión previa, así
      // que NO llamamos a DELETE /orders/session (evita el 404 "No existe una
      // sesión de compra activa" que ensuciaba la consola en rojo).
      await createQuote(cid);
    } catch (e) {
      const status = e?.response?.status;
      // Solo si de verdad había una sesión colgada (409/400) la limpiamos y
      // reintentamos una vez (equivalente al deleteOrderSessionWithRetries web).
      if (status === 409 || status === 400) {
        await cancelSessionWithRetries().catch(() => {});
        await new Promise((r) => setTimeout(r, 400));
        await createQuote(cid);
      } else {
        throw e;
      }
    }
  }, []);

  /**
   * Inicializa (o reutiliza) la sesión de compra para una sucursal.
   * Idempotente: si ya está lista para esa sucursal, no hace nada.
   * Lo llama la PRIMERA pantalla del flujo (selección de boletos).
   *
   * @param {number} cinemaId
   * @param {{force?: boolean}} opts - force=true recrea la quote aunque el
   *   provider crea que sigue activa (p. ej. cuando el backend reporta que
   *   expiró en Redis y el estado local quedó desactualizado).
   */
  const initSession = useCallback(
    async (cinemaId, { force = false } = {}) => {
      const cid = Number(cinemaId);
      if (!cid) {
        setError('No se recibió la sucursal.');
        return false;
      }
      if (!force && quoteReady && activeCinemaRef.current === cid) return true;
      if (initLockRef.current) return false; // ya hay una init en vuelo

      initLockRef.current = true;
      setInitializing(true);
      setError(null);
      try {
        await _openQuote(cid);
        activeCinemaRef.current = cid;
        // Registramos la propiedad de la quote recién creada
        globalSessionEpoch += 1;
        myEpochRef.current = globalSessionEpoch;
        setQuoteReady(true);
        return true;
      } catch (e) {
        setQuoteReady(false);
        activeCinemaRef.current = null;
        setError(
          e?.response?.data?.message || 'No se pudo iniciar la sesión de compra.'
        );
        return false;
      } finally {
        setInitializing(false);
        initLockRef.current = false;
      }
    },
    [quoteReady, _openQuote]
  );

  /**
   * Cierra la sesión de compra (al cancelar o al completar la compra).
   */
  const endSession = useCallback(async () => {
    setQuoteReady(false);
    activeCinemaRef.current = null;
    // Cierre explícito: avanzamos el epoch para que ningún cleanup pendiente
    // (de esta u otra instancia) vuelva a cancelar después de esto.
    globalSessionEpoch += 1;
    myEpochRef.current = 0;
    await cancelSessionWithRetries().catch(() => {});
  }, []);

  // Al desmontar el provider liberamos la sesión, PERO solo si la quote de
  // esta instancia sigue siendo la vigente (epoch). Si otra instancia ya creó
  // una quote más nueva (remontaje durante la navegación), no la tocamos.
  useEffect(() => {
    return () => {
      if (
        activeCinemaRef.current != null &&
        myEpochRef.current !== 0 &&
        myEpochRef.current === globalSessionEpoch
      ) {
        globalSessionEpoch += 1; // invalida reintentos tardíos propios
        // UN solo intento, sin reintentos: un DELETE rezagado reintentándose
        // era capaz de borrar la quote creada por la instancia nueva. Si este
        // intento falla, el TTL de Redis limpia la quote huérfana y el
        // manejador del 409 en _openQuote la recupera al reabrir el flujo.
        cancelSession().catch(() => {});
      }
      disconnectSocket();
    };
  }, []);

  return (
    <PurchaseSessionContext.Provider
      value={{ quoteReady, initializing, error, initSession, endSession }}
    >
      {children}
    </PurchaseSessionContext.Provider>
  );
}

export function usePurchaseSession() {
  const ctx = useContext(PurchaseSessionContext);
  if (ctx === undefined) {
    throw new Error(
      'usePurchaseSession debe usarse dentro de <PurchaseSessionProvider>'
    );
  }
  return ctx;
}
