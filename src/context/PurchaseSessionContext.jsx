import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import {
  createQuote,
  cancelSessionWithRetries,
  getSessionState,
} from '../services/orders.service';

const PurchaseSessionContext = createContext(undefined);

// ─── Epoch de sesión a nivel de MÓDULO ───────────────────────────────────────
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
      await createQuote(cid);
    } catch (e) {
      const status = e?.response?.status;
      if (status !== 409 && status !== 400) throw e;

      // 409 = "Ya tienes una sesión activa". Estrategia de la WEB (probada en
      // producción): ADOPTAR la sesión existente en lugar de pelear con ella.
      // Cancelar+recrear generaba carreras cuando la pantalla se remontaba.
      try {
        const state = await getSessionState();
        const sameCinema = Number(state?.cinema) === Number(cid);
        const earlyStage = !state?.status || state.status === 'pending_order';
        if (state && sameCinema && earlyStage) {
          // Sesión compatible: la reusamos tal cual. Nada más que hacer.
          return;
        }
        if (__DEV__ && state) {
          // La sesión existente pertenece a OTRO flujo (posiblemente de otro
          // dispositivo con la misma cuenta: la sesión de compra es única por
          // usuario en todo el sistema, web y móvil la comparten).
          console.log(
            '[quote] sesión existente incompatible → se resetea:',
            `cinema=${state.cinema} status=${state.status} order=${state.order_id ?? '—'}`
          );
        }
      } catch {
        // No se pudo consultar el estado: caemos al último recurso de abajo.
      }

      // Último recurso: la sesión existente es de OTRA sucursal o quedó a
      // mitad de un flujo anterior (orden pendiente de pago abandonada).
      // Solo entonces la limpiamos y creamos una nueva.
      await cancelSessionWithRetries().catch(() => {});
      await new Promise((r) => setTimeout(r, 400));
      await createQuote(cid);
    }
  }, []);

  /**
   * Inicializa (o reutiliza) la sesión de compra para una sucursal.
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
   * @param {{skipServerCancel?: boolean}} opts - skipServerCancel=true cuando
   *   el backend ya eliminó la quote (pago completado): evita un DELETE
   *   /orders/session que siempre respondería 404.
   */
  const endSession = useCallback(async ({ skipServerCancel = false } = {}) => {
    setQuoteReady(false);
    activeCinemaRef.current = null;
    // Cierre explícito: avanzamos el epoch para que ningún cleanup pendiente
    // (de esta u otra instancia) vuelva a cancelar después de esto.
    globalSessionEpoch += 1;
    myEpochRef.current = 0;
    if (!skipServerCancel) {
      await cancelSessionWithRetries().catch(() => {});
    }
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
