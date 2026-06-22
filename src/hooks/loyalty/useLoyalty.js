import { useCallback, useEffect, useState } from 'react';
import { usersService } from '../../services/users.service';

const LEDGERS_PAGE_LIMIT = 20;

/**
 * Hook centralizado para el módulo de CinePuntos (Programa de Lealtad).
 *
 * Responsabilidades:
 * - loyaltyInfo: nivel actual, nombre de nivel y balance (GET /users/me/loyalty)
 * - levels: escalera completa de niveles + progreso al siguiente (GET /users/me/loyalty/levels)
 * - transactions: historial paginado de movimientos (GET /users/me/loyalty/ledgers)
 *
 * Se usa tanto en PaymentScreen (saldo disponible para canjear) como en
 * todo el módulo de loyalty-program (index, history, rewards).
 */
export const useLoyalty = ({ withTransactions = false } = {}) => {
  const [loyaltyInfo, setLoyaltyInfo] = useState(null);
  const [levels, setLevels] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const loadSummary = useCallback(async () => {
    try {
      const [info, levelsData] = await Promise.all([
        usersService.getLoyaltyInfo(),
        usersService.getLoyaltyLevels(),
      ]);
      setLoyaltyInfo(info);
      setLevels(levelsData);
      setError(null);
    } catch (err) {
      console.error('Error al cargar resumen de CinePuntos:', err);
      setError('No se pudo cargar tu información de CinePuntos.');
    }
  }, []);

  const loadTransactions = useCallback(
    async (page = 1, { append = false } = {}) => {
      try {
        const result = await usersService.getLoyaltyLedgers({
          page,
          limit: LEDGERS_PAGE_LIMIT,
        });
        const rows = result?.rows ?? result ?? [];
        const count = result?.count ?? rows.length;

        setTransactions((prev) => (append ? [...prev, ...rows] : rows));
        setTransactionsCount(count);
        setTransactionsPage(page);
        setHasMoreTransactions(page * LEDGERS_PAGE_LIMIT < count);
        setError(null);
      } catch (err) {
        console.error('Error al cargar historial de CinePuntos:', err);
        setError('No se pudo cargar tu historial de movimientos.');
      }
    },
    []
  );

  const loadMoreTransactions = useCallback(async () => {
    if (loadingMore || !hasMoreTransactions) return;
    setLoadingMore(true);
    try {
      await loadTransactions(transactionsPage + 1, { append: true });
    } finally {
      setLoadingMore(false);
    }
  }, [loadTransactions, loadingMore, hasMoreTransactions, transactionsPage]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await loadSummary();
      if (withTransactions) await loadTransactions(1);
    } finally {
      setLoading(false);
    }
  }, [loadSummary, loadTransactions, withTransactions]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // Resumen de nivel y balance
    loyaltyInfo,
    pointsBalance: loyaltyInfo?.points_balance ?? 0,
    levels,
    currentLevel: levels?.current_level ?? null,
    nextLevel: levels?.next_level ?? null,
    pointsToNextLevel: levels?.points_to_next_level ?? 0,

    // Historial paginado
    transactions,
    transactionsCount,
    hasMoreTransactions,
    loadingMore,
    loadMoreTransactions,

    // Estado general
    loading,
    error,
    refresh,
  };
};
