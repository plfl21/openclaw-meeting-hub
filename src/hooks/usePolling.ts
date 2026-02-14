import { useState, useEffect, useCallback, useRef } from 'react';

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  intervalMs: number,
  enabled: boolean = true
): { data: T | null; loading: boolean; error: string | null; refresh: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchRef = useRef(fetchFn);

  useEffect(() => {
    fetchRef.current = fetchFn;
  }, [fetchFn]);

  const refresh = useCallback(async () => {
    try {
      setLoading(prev => prev);
      const result = await fetchRef.current();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Fetch failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    const doFetch = async () => {
      try {
        const result = await fetchRef.current();
        if (mounted) {
          setData(result);
          setError(null);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Fetch failed');
          setLoading(false);
        }
      }
    };

    doFetch();
    const interval = setInterval(doFetch, intervalMs);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [intervalMs, enabled]);

  return { data, loading, error, refresh };
}
