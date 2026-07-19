import { useEffect, useRef } from 'react';
import { getSocket } from '../../services/socket.service';

/**
 * Hook que escucha el dictamen asincrónico de los pagos vía Socket.io.
 *
 * @param {object} handlers
 * @param {(data:{orderId:number, qrCode:string}) => void} handlers.onCompleted
 * @param {(data:{remaining_balance:number, message:string}) => void} handlers.onPartialSuccess
 * @param {(data:{orderId:number, qrCode:string, message?:string}) => void} handlers.onBillingRequired
 * @param {(data:{message:string}) => void} handlers.onFailed
 * @param {boolean} enabled
 */
export function usePaymentEvents(handlers = {}, enabled = true) {
  const { onCompleted, onPartialSuccess, onBillingRequired, onFailed } =
    handlers;

  const handlersRef = useRef({});
  handlersRef.current = {
    onCompleted,
    onPartialSuccess,
    onBillingRequired,
    onFailed,
  };

  const socketRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const handleCompleted = (data) =>
      handlersRef.current.onCompleted?.(data || {});
    const handlePartial = (data) =>
      handlersRef.current.onPartialSuccess?.(data || {});
    const handleBilling = (data) =>
      handlersRef.current.onBillingRequired?.(data || {});
    const handleFailed = (data) =>
      handlersRef.current.onFailed?.(data || {});

    (async () => {
      const socket = await getSocket();
      if (cancelled) return;
      socketRef.current = socket;

      socket.on('payment_completed', handleCompleted);
      socket.on('payment_success', handlePartial);
      socket.on('billing_required', handleBilling);
      socket.on('payment_failed', handleFailed);

      if (!socket.connected) socket.connect();
    })();

    return () => {
      cancelled = true;
      const socket = socketRef.current;
      if (socket) {
        socket.off('payment_completed', handleCompleted);
        socket.off('payment_success', handlePartial);
        socket.off('billing_required', handleBilling);
        socket.off('payment_failed', handleFailed);
      }
    };
  }, [enabled]);
}
