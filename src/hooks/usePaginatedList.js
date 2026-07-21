import { useState, useCallback, useRef } from 'react';

export function usePaginatedList(fetchFn) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  const load = useCallback(async (page = 1) => {
    try {
      const result = await fetchFn(page);
      const data = Array.isArray(result) ? result : result?.items || [];
      const metadata = Array.isArray(result) ? null : result?.metadata;

      if (page === 1) {
        setItems(data);
      } else {
        setItems(prev => [...prev, ...data]);
      }

      setHasMore(metadata?.next_page != null);
      pageRef.current = page;
    } catch (error) {
      console.error('Error en usePaginatedList:', error.message);
    }
  }, [fetchFn]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await load(pageRef.current + 1);
    setLoadingMore(false);
  }, [loadingMore, hasMore, load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load(1);
    setRefreshing(false);
  }, [load]);

  const reset = useCallback(() => {
    setItems([]);
    setLoading(true);
    setHasMore(true);
    pageRef.current = 1;
  }, []);

  return {
    items,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    load,
    loadMore,
    refresh,
    reset,
    setItems,
    setLoading,
  };
}
