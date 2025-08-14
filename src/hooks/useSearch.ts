'use client';

import { useState, useCallback, useEffect } from 'react';
import debounce from 'lodash.debounce';

type Item = {
  item_id: number;
  name_ko: string;
};

export function useSearch() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (q: string) => {
      if (!q) {
        setItems([]);
        return;
      }
      setLoading(true);
      const res = await fetch(`/api/items?q=${q}`);
      const data = await res.json();
      setItems(data.items);
      setLoading(false);
    }, 300),
    []
  );

  const debouncedAutocomplete = useCallback(
    debounce(async (q: string) => {
      if (!q) {
        setSuggestions([]);
        return;
      }
      const res = await fetch(`/api/autocomplete?q=${q}`);
      const data = await res.json();
      setSuggestions(data);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
    debouncedAutocomplete(query);
  }, [query, debouncedSearch, debouncedAutocomplete]);

  return { query, setQuery, items, suggestions, loading };
}
