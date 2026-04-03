import { useState, useEffect, useRef } from 'react';
import type { SearchResponse } from '../types/product';

/** Base URL for the API (no trailing slash). When unset, use relative `/api` so Vite dev proxy can forward. */
function searchUrl(query: string): string {
  const base = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
  const path = `/api/search?q=${encodeURIComponent(query)}`;
  return base ? `${base}${path}` : path;
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setError(null);
      return;
    }

    // Debounce
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      // Cancel previous request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(searchUrl(query), {
          signal: abortControllerRef.current.signal,
        });
        
        if (!response.ok) {
          throw new Error('Search failed');
        }
        
        const data: SearchResponse = await response.json();
        setResults(data);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
        setError(err.message || 'An error occurred');
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query]);

  return { query, setQuery, results, loading, error };
}
