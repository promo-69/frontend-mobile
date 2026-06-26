import { useCallback, useEffect, useRef, useState } from 'react';
import { getSocket } from '../../services/socket.service';

/**
 * Hook que gestiona el bloqueo de asientos en tiempo real vía Socket.io.
 *
 * Contrato con el backend (booking-socket.service.ts):
 *  - Emite: join_showtime { showtimeId }, lock_seat { seatId },
 *           unlock_seat { seatId }, leave_showtime { showtimeId }
 *  - Escucha: join_success, join_error, seat_lock_success, seat_lock_error,
 *             seat_locked_by_other, seat_unlocked, seats_unlocked,
 *             seats_sold_final, quote_expired
 *
 * @param {number|string} showtimeId - Función a la que conectarse.
 * @param {object} handlers
 * @param {(seatIds:number[]) => void} handlers.onSeatsTakenByOthers - Asientos que otros bloquearon/compraron.
 * @param {(seatIds:number[]) => void} handlers.onSeatsReleased - Asientos liberados por otros.
 * @param {() => void} handlers.onQuoteExpired - La sesión de compra venció.
 */
export function useSeatLock(showtimeId, handlers = {}, enabled = true) {
  const { onSeatsTakenByOthers, onSeatsReleased, onQuoteExpired } = handlers;

  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState(null);
  // Indica si el tiempo real está disponible y listo, o si caímos a modo
  // degradado (sin bloqueo en vivo) por timeout/fallo de conexión.
  const [realtimeReady, setRealtimeReady] = useState(false);

  const socketRef = useRef(null);
  // Mantenemos refs a los handlers para no re-suscribir listeners en cada render
  const handlersRef = useRef({});
  handlersRef.current = {
    onSeatsTakenByOthers,
    onSeatsReleased,
    onQuoteExpired,
  };

  // Resolutores pendientes de lock_seat (seatId -> {resolve, reject})
  const pendingLocks = useRef(new Map());

  useEffect(() => {
    if (!showtimeId || !enabled) return;

    let cancelled = false;
    let socket;
    // Timeout: si no logramos unirnos en 6s, habilitamos modo degradado para
    // no bloquear la selección de asientos indefinidamente.
    let joinTimeout = setTimeout(() => {
      if (!cancelled) {
        setRealtimeReady(true);
        if (__DEV__) console.log('[useSeatLock] join timeout → modo degradado');
      }
    }, 6000);

    (async () => {
      socket = await getSocket();
      if (cancelled) return;
      socketRef.current = socket;

      const handleConnect = () => {
        setConnected(true);
        // Al (re)conectar, nos unimos a la sala de la función
        socket.emit('join_showtime', { showtimeId: Number(showtimeId) });
      };

      const handleDisconnect = () => {
        setConnected(false);
        setJoined(false);
      };

      const handleJoinSuccess = () => {
        setJoined(true);
        setJoinError(null);
        setRealtimeReady(true);
        clearTimeout(joinTimeout);
      };

      const handleJoinError = (data) => {
        setJoined(false);
        setJoinError(data?.message || 'No se pudo conectar a la función.');
        // Caemos a modo degradado: permitimos seguir sin tiempo real
        setRealtimeReady(true);
        clearTimeout(joinTimeout);
      };

      const handleLockSuccess = (data) => {
        const seatId = Number(data?.seatId);
        const pending = pendingLocks.current.get(seatId);
        if (pending) {
          pending.resolve(true);
          pendingLocks.current.delete(seatId);
        }
      };

      const handleLockError = (data) => {
        const seatId = Number(data?.seatId);
        const pending = pendingLocks.current.get(seatId);
        if (pending) {
          pending.reject(new Error(data?.message || 'Asiento ocupado'));
          pendingLocks.current.delete(seatId);
        }
        // Si otro usuario tomó el asiento, lo marcamos como no disponible
        if (!isNaN(seatId)) {
          handlersRef.current.onSeatsTakenByOthers?.([seatId]);
        }
      };

      const handleLockedByOther = (data) => {
        const seatId = Number(data?.seatId);
        if (!isNaN(seatId))
          handlersRef.current.onSeatsTakenByOthers?.([seatId]);
      };

      const handleUnlocked = (data) => {
        // seat_unlocked trae { seatId }; seats_unlocked trae { seatIds }
        const ids = data?.seatIds
          ? data.seatIds.map(Number)
          : data?.seatId != null
            ? [Number(data.seatId)]
            : [];
        if (ids.length) handlersRef.current.onSeatsReleased?.(ids);
      };

      const handleSoldFinal = (data) => {
        const ids = (data?.seatIds || []).map(Number);
        if (ids.length) handlersRef.current.onSeatsTakenByOthers?.(ids);
      };

      const handleQuoteExpired = () => {
        handlersRef.current.onQuoteExpired?.();
      };

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('join_success', handleJoinSuccess);
      socket.on('join_error', handleJoinError);
      socket.on('seat_lock_success', handleLockSuccess);
      socket.on('seat_lock_error', handleLockError);
      socket.on('seat_locked_by_other', handleLockedByOther);
      socket.on('seat_unlocked', handleUnlocked);
      socket.on('seats_unlocked', handleUnlocked);
      socket.on('seats_sold_final', handleSoldFinal);
      socket.on('quote_expired', handleQuoteExpired);

      // Si ya estaba conectado, unirse de inmediato
      if (socket.connected) handleConnect();

      // Cleanup de listeners al desmontar
      socket._cleanupSeatLock = () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('join_success', handleJoinSuccess);
        socket.off('join_error', handleJoinError);
        socket.off('seat_lock_success', handleLockSuccess);
        socket.off('seat_lock_error', handleLockError);
        socket.off('seat_locked_by_other', handleLockedByOther);
        socket.off('seat_unlocked', handleUnlocked);
        socket.off('seats_unlocked', handleUnlocked);
        socket.off('seats_sold_final', handleSoldFinal);
        socket.off('quote_expired', handleQuoteExpired);
      };
    })();

    return () => {
      cancelled = true;
      clearTimeout(joinTimeout);
      const s = socketRef.current;
      if (s) {
        // NO emitimos leave_showtime automáticamente: al avanzar en el flujo de
        // compra debemos conservar los bloqueos. El consumidor decide cuándo
        // liberar llamando a leave() (p.ej. al volver atrás o cancelar).
        s._cleanupSeatLock?.();
      }
      pendingLocks.current.clear();
    };
  }, [showtimeId, enabled]);

  /**
   * Solicita el bloqueo de un asiento. Devuelve una promesa que resuelve si el
   * backend confirma (seat_lock_success) o rechaza (seat_lock_error/timeout).
   */
  const lockSeat = useCallback((seatId) => {
    const socket = socketRef.current;
    const id = Number(seatId);
    // Modo degradado: si no hay conexión en tiempo real, permitimos seleccionar
    // confiando en la validación del backend al hacer checkout.
    if (!socket || !socket.connected) {
      return Promise.resolve(true);
    }
    return new Promise((resolve, reject) => {
      // Timeout de seguridad por si el backend no responde
      const timeout = setTimeout(() => {
        pendingLocks.current.delete(id);
        // En vez de bloquear al usuario, permitimos continuar (el checkout valida)
        resolve(true);
      }, 6000);

      pendingLocks.current.set(id, {
        resolve: (v) => {
          clearTimeout(timeout);
          resolve(v);
        },
        reject: (e) => {
          clearTimeout(timeout);
          reject(e);
        },
      });

      socket.emit('lock_seat', { seatId: id });
    });
  }, []);

  /**
   * Libera un asiento previamente bloqueado por este usuario.
   */
  const unlockSeat = useCallback((seatId) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    socket.emit('unlock_seat', { seatId: Number(seatId) });
  }, []);

  /**
   * Abandona la función liberando todos los bloqueos del usuario en el backend.
   * Llamar solo al cancelar/volver atrás, NO al avanzar en el flujo de compra.
   *
   * Robustez: si el socket no está conectado en el momento de salir (caso común
   * en móvil al cerrar pantalla o reconectar), intentamos (re)conectar y emitir
   * en cuanto haya conexión, para no perder la liberación de los asientos.
   */
  const leave = useCallback(() => {
    const sid = Number(showtimeId);
    if (!sid) return;

    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit('leave_showtime', { showtimeId: sid });
      return;
    }

    // Socket caído o reconectando: aseguramos la emisión al reconectar.
    (async () => {
      try {
        const s = await getSocket();
        socketRef.current = s;
        if (s.connected) {
          s.emit('leave_showtime', { showtimeId: sid });
        } else {
          // Emitir una sola vez cuando se restablezca la conexión.
          s.once('connect', () => {
            s.emit('leave_showtime', { showtimeId: sid });
          });
        }
      } catch {
        // Si no se logra, el backend liberará por expiración de TTL/sesión.
      }
    })();
  }, [showtimeId]);

  return {
    connected,
    joined,
    realtimeReady,
    joinError,
    lockSeat,
    unlockSeat,
    leave,
  };
}
