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
  const initLockRef = useRef(false);

  const _openQuote = useCallback(async (cid) => {
    // Limpieza robusta previa (equivalente a deleteOrderSessionWithRetries en web)
    await cancelSessionWithRetries().catch(() => {});
    try {
      await createQuote(cid);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 409 || status === 400) {
        await cancelSessionWithRetries().catch(() => {});
        await new Promise((r) => setTimeout(r, 400));
        await createQuote(cid);
      } else {
        throw e;
      }
    }
  }, []);

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
