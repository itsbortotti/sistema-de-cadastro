import { useState, useEffect, useCallback } from 'react';

const MAX_VISIBLE = 6;
const STORAGE_PREFIX = 'listColumns_';

/**
 * Persiste e recupera quais colunas estão visíveis na listagem (máx. 6).
 * @param {string} storageKey - Chave por página (ex: 'usuarios', 'empresas')
 * @param {Array<{ id: string, label: string }>} allColumns - Todas as colunas disponíveis (ordem padrão)
 * @returns {{ visibleIds: string[], setVisibleIds: (ids: string[]) => void, allColumns: array }}
 */
export function useListColumns(storageKey, allColumns) {
  const key = STORAGE_PREFIX + storageKey;

  const [visibleIds, setVisibleIdsState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter((id) => allColumns.some((c) => c.id === id));
          if (valid.length > 0) return valid.slice(0, MAX_VISIBLE);
        }
      }
    } catch (_) {}
    return allColumns.slice(0, MAX_VISIBLE).map((c) => c.id);
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(visibleIds));
    } catch (_) {}
  }, [key, visibleIds]);

  const setVisibleIds = useCallback((ids) => {
    const filtered = (Array.isArray(ids) ? ids : []).filter((id) =>
      allColumns.some((c) => c.id === id)
    );
    setVisibleIdsState(filtered.slice(0, MAX_VISIBLE));
  }, [allColumns]);

  return { visibleIds, setVisibleIds, allColumns };
}
