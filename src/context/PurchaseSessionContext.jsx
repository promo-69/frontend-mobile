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
  cancelSessionWithRetries,
} from '../services/orders.service';
import { disconnectSocket } from '../services/socket.service';

const PurchaseSessionContext = createContext(undefined);

export function PurchaseSessionProvider({ children }) {
  const [quoteReady, setQuoteReady] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState(null);

  // Sucursal para la que la quote está activa (evita reabrir si ya está lista)
  const activeCinemaRef = useRef(null);
  // Candado anti-carrera: garantiza un solo createQuote en vuelo
  // Candado anti-carrera: garantiza un solo createQuote en vuelo
    const initLockRef = useRef(false);

    // --- SONDA TEMPORAL ---
    useEffect(() => {
      console.log('🟢 PROVIDER MONTADO');
      return () => console.log('🔴 PROVIDER DESMONTADO');
    }, []);
    // --- FIN SONDA ---

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
   */
  const initSession = useCallback(
    async (cinemaId) => {
      const cid = Number(cinemaId);
      if (!cid) {
        setError('No se recibió la sucursal.');
        return false;
      }
      if (quoteReady && activeCinemaRef.current === cid) return true;
      if (initLockRef.current) return false; // ya hay una init en vuelo

      initLockRef.current = true;
      setInitializing(true);
      setError(null);
      try {
        await _openQuote(cid);
        activeCinemaRef.current = cid;
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
    await cancelSessionWithRetries().catch(() => {});
  }, []);

  // Al desmontar el provider (salir de todo el grupo (buy)) liberamos la sesión.
  useEffect(() => {
    return () => {
      cancelSessionWithRetries().catch(() => {});
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
